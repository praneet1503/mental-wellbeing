from fastapi import FastAPI, Depends
from auth import verify_api_key

web_app = FastAPI(dependencies=[Depends(verify_api_key)])

@web_app.get("/health")
async def health():
    return {"status": "ok"}
