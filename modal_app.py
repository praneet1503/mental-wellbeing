from __future__ import annotations

import asyncio
import os
import sys
from functools import lru_cache
from pathlib import Path

import modal
from fastapi import Depends, FastAPI, HTTPException
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
from app.auth import verify_token  # noqa: E402
from app.core.cors import apply_cors  # noqa: E402
from app.llm.sambanova import SambaNovaClient  # noqa: E402
from app.safety.rules import apply_safety_rules  # noqa: E402
from app.schemas import ChatRequest, ChatResponse, ModelsResponse  # noqa: E402
from app.settings import Settings  # noqa: E402
from app.db import get_firestore  # noqa: E402

image = (
    modal.Image.debian_slim()
    .pip_install(
    "fastapi",
    "firebase-admin",
    "httpx",
    "pydantic",
    "pydantic-settings",
    )
    .add_local_dir(
        PROJECT_ROOT,
        remote_path=REMOTE_PROJECT_ROOT,
        ignore=[
            ".git",
            ".git/**",
            ".venv",
            ".venv/**",
            "node_modules",
            "node_modules/**",
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

# Allow Vercel production and preview domains for CORS. This is set before Settings()
# is instantiated so the CORS middleware can validate these origins.
# Production: https://mental-wellbeing.vercel.app
# Previews: https://*.vercel.app (handled by regex in cors.py)
if "FRONTEND_ORIGIN" not in os.environ:
    os.environ["FRONTEND_ORIGIN"] = "https://mental-wellbeing.vercel.app"

# CORS uses dynamic origin checks to safely allow Vercel preview URLs and localhost
# while keeping allow_credentials=True. Wildcard origins are unsafe with credentials
# because they allow any origin to receive auth tokens. The middleware explicitly
# validates Vercel preview hostnames instead of using "*" to avoid that risk.
apply_cors(fastapi_app, Settings())

fastapi_app.include_router(health_router)
fastapi_app.include_router(usage_router)
fastapi_app.include_router(users_router)


@fastapi_app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, token: dict = Depends(verify_token)) -> ChatResponse:
    firebase_uid = token.get("uid")
    if not firebase_uid:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    db = get_firestore()
    user_ref = db.collection("users").document(firebase_uid)

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

    safety_reply = apply_safety_rules(request.message)
    if safety_reply:
        return ChatResponse(reply=safety_reply)

    system_prompt = load_system_prompt()
    reply = run_llm.remote(
        prompt=request.message,
        system_prompt=system_prompt,
        model=request.model,
        action="generate",
    )
    return ChatResponse(reply=reply)


@fastapi_app.get("/models", response_model=ModelsResponse)
def list_models() -> ModelsResponse:
    models = run_llm.remote(
        prompt="",
        system_prompt="",
        action="list_models",
    )
    return ModelsResponse(models=models)


@app.function(
    image=image,
    secrets=modal_secrets,
)
@modal.asgi_app()
def api():
    return fastapi_app
