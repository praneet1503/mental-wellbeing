from fastapi import FastAPI

web_app = FastAPI()

@web_app.get("/health")
async def health():
    return {"status": "ok"}
