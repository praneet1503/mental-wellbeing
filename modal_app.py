from __future__ import annotations

import asyncio
import os
import sys
from functools import lru_cache
from uuid import uuid4
from pathlib import Path

import modal
from fastapi import Depends, FastAPI, HTTPException, Request
from firebase_admin import firestore

PROJECT_ROOT = Path(__file__).resolve().parent
REMOTE_PROJECT_ROOT = Path("/root/mental-wellbeing")


def _ensure_backend_on_path() -> None:
    local_backend = PROJECT_ROOT / "backend"
    remote_backend = REMOTE_PROJECT_ROOT / "backend"
    for path in (remote_backend, local_backend):
        if path.exists() and str(path) not in sys.path:
            sys.path.insert(0, str(path))


_ensure_backend_on_path()

from app.api.health import router as health_router  # noqa: E402
from app.api.usage import router as usage_router  # noqa: E402
from app.api.users import router as users_router  # noqa: E402
from app.auth import require_verified_user  # noqa: E402
from app.core.cors import apply_cors  # noqa: E402
from app.core.logging import RequestLogMiddleware  # noqa: E402
from app.core.rate_limit import apply_rate_limiting, limiter, uid_limit_key  # noqa: E402
from app.llm.sambanova import SambaNovaClient  # noqa: E402
from app.safety.pipeline import assess_input, assess_output  # noqa: E402
from app.schemas import ChatRequest, ChatResponse, ModelsResponse  # noqa: E402
from app.settings import Settings, validate_runtime_settings  # noqa: E402
from app.db import get_firestore  # noqa: E402

image = (
    modal.Image.debian_slim()
    .pip_install(
    "fastapi",
    "firebase-admin",
    "httpx",
    "pydantic",
    "pydantic-settings",
    "slowapi",
    )
    .add_local_dir(
        PROJECT_ROOT / "backend",
        remote_path=REMOTE_PROJECT_ROOT / "backend",
        ignore=[
            ".git",
            ".git/**",
            ".venv",
            ".venv/**",
            "node_modules",
            "node_modules/**",
            ".next",
            ".next/**",
            "firebase-adminsdk-*.json",
            "service-account*.json",
            "__pycache__",
            "**/__pycache__",
            "*.pyc",
            ".pytest_cache",
            ".pytest_cache/**",
        ],
    )
)

app = modal.App("echomind-api")

modal_secrets = [
    modal.Secret.from_name("firebase-service-account"),
    modal.Secret.from_name("sambanova-api-key"),
]


def _prompt_path() -> Path:
    remote_path = REMOTE_PROJECT_ROOT / "backend" / "app" / "prompts" / "therapist.txt"
    local_path = PROJECT_ROOT / "backend" / "app" / "prompts" / "therapist.txt"
    return remote_path if remote_path.exists() else local_path


@lru_cache(maxsize=1)
def load_system_prompt() -> str:
    return _prompt_path().read_text(encoding="utf-8").strip()


@app.function(
    timeout=60,
    image=image,
    secrets=modal_secrets,
)
def run_llm(prompt: str, system_prompt: str, model: str | None = None, action: str = "generate"):
    settings = Settings()
    client = SambaNovaClient(settings)

    if action == "list_models":
        return asyncio.run(client.list_models())

    return asyncio.run(
        client.generate(
            message=prompt,
            system_prompt=system_prompt,
            model=model,
        )
    )


fastapi_app = FastAPI(title="EchoMind API")
_app_configured = False


def _configure_fastapi_app() -> None:
    global _app_configured
    if _app_configured:
        return

    settings = Settings()
    validate_runtime_settings(settings)

    # CORS uses dynamic origin checks to safely allow Vercel preview URLs and localhost
    # while keeping allow_credentials=True. Wildcard origins are unsafe with credentials
    # because they allow any origin to receive auth tokens. The middleware explicitly
    # validates Vercel preview hostnames instead of using "*" to avoid that risk.
    apply_cors(fastapi_app, settings)
    apply_rate_limiting(fastapi_app)
    fastapi_app.add_middleware(RequestLogMiddleware)

    fastapi_app.include_router(health_router)
    fastapi_app.include_router(usage_router)
    fastapi_app.include_router(users_router)

    _app_configured = True


@fastapi_app.post("/chat", response_model=ChatResponse)
@limiter.limit("10/minute", key_func=uid_limit_key)
def chat(request: Request, payload: ChatRequest, token: dict = Depends(require_verified_user)) -> ChatResponse:
    firebase_uid = token.get("uid")
    if not firebase_uid:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    db = get_firestore()
    user_ref = db.collection("users").document(firebase_uid)

    safety_decision = assess_input(payload.message)
    if safety_decision.response:
        conversation_id = payload.conversation_id or uuid4().hex
        return ChatResponse(reply=safety_decision.response, conversation_id=conversation_id)

    @firestore.transactional
    def reserve_quota(transaction: firestore.Transaction) -> None:
        snapshot = transaction.get(user_ref)
        if not hasattr(snapshot, "exists"):
            if isinstance(snapshot, list):
                snapshot = snapshot[0] if snapshot else None
            else:
                snapshot = next(iter(snapshot), None)
        if snapshot is None:
            raise HTTPException(status_code=404, detail="User profile not found")
        if not snapshot.exists:
            raise HTTPException(status_code=404, detail="User profile not found")
        data = snapshot.to_dict() or {}
        used = int(data.get("quota_used", 0))
        limit = int(data.get("quota_limit", 25))
        if used >= limit:
            raise HTTPException(status_code=429, detail="You have reached your usage limit")
        transaction.update(user_ref, {"quota_used": used + 1})

    transaction = db.transaction()
    reserve_quota(transaction)

    conversation_id = payload.conversation_id or uuid4().hex

    settings = Settings()
    validate_runtime_settings(settings)
    system_prompt = load_system_prompt()
    try:
        reply = run_llm.remote(
            prompt=payload.message,
            system_prompt=system_prompt,
            model=settings.sambanova_model,
            action="generate",
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    output_decision = assess_output(reply)
    if output_decision.response:
        return ChatResponse(reply=output_decision.response, conversation_id=conversation_id)

    return ChatResponse(reply=reply, conversation_id=conversation_id)


@fastapi_app.get("/models", response_model=ModelsResponse)
@limiter.limit("10/minute", key_func=uid_limit_key)
def list_models(request: Request, token: dict = Depends(require_verified_user)) -> ModelsResponse:
    # Production check removed - models endpoint is now available in all environments
    settings = Settings()
    validate_runtime_settings(settings)
    models = run_llm.remote(
        prompt="",
        system_prompt="",
        action="list_models",
    )
    allowed = set(settings.allowed_models or [settings.sambanova_model])
    filtered = [model for model in models if model in allowed]
    return ModelsResponse(models=filtered)


@app.function(
    image=image,
    secrets=modal_secrets,
)
@modal.asgi_app()
def api():
    _configure_fastapi_app()
    return fastapi_app
