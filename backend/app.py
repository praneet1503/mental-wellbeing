import modal

image = (
    modal.Image.debian_slim()
    # Install dependencies
    .pip_install_from_requirements("requirements.txt")
    # Set the simplified API Key for MVP
    .env({"BACKEND_API_KEY": "mw-secure-123"})
)

app = modal.App("mw-api")

@app.function(
    image=image
)
@modal.asgi_app()
def web():
    import main
    return main.app

