import modal
from api import web_app

# Create a Modal image using debian_slim and install dependencies
image = (
    modal.Image.debian_slim()
    .pip_install("fastapi", "uvicorn")
)

# App definition
app = modal.App("mw-api")

# Expose the FastAPI app as an ASGI app
@app.function(image=image)
@modal.asgi_app()
def web():
    return web_app
