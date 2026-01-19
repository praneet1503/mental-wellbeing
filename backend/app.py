import modal
from api import web_app

# Create a Modal image using debian_slim and install dependencies
image = (
    modal.Image.debian_slim()
    .pip_install_from_requirements("requirements.txt")
)

# App definition
app = modal.App("mw-api")

# Expose the FastAPI app as an ASGI app
@app.function(
    image=image,
    secrets=[modal.Secret.from_name("wellbeing-backend-secret")]
)
@modal.asgi_app()
def web():
    return web_app
