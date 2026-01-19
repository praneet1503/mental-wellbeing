import os
from fastapi import Security, HTTPException, status, Request
from fastapi.security import APIKeyHeader

api_key_header = APIKeyHeader(name="X-API-KEY", auto_error=False)

async def verify_api_key(request: Request, api_key: str = Security(api_key_header)):
    if request.url.path == "/health" or request.url.path == "/health/":
        return

    expected_key = os.environ.get("BACKEND_API_KEY")
    if not expected_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="BACKEND_API_KEY environment variable is not set"
        )

    if not api_key or api_key != expected_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API Key"
        )
    return api_key
