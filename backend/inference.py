import modal

# Configurations
# Switched to Qwen 2.5 (Open/Non-Gated) to resolve 401 Auth Errors with LLaMA-3
MODEL_NAME = "Qwen/Qwen2.5-7B-Instruct"

# Dependencies
# We include 'fastapi' because the API might pass Pydantic models or similar objects,
# and it's generally good for compatibility with the caller environment.
image = (
    modal.Image.debian_slim()
    .pip_install("vllm", "torch", "huggingface_hub", "fastapi")
)

app = modal.App("mw-inference")

@app.cls(
    gpu=modal.gpu.A10G(), 
    timeout=600, 
    image=image, 
    secrets=[modal.Secret.from_name("wellbeing-backend-secret")]
)
class Model:
    @modal.enter()
    def load_model(self):
        from vllm import LLM, SamplingParams
        
        # Consistent sampling for empathy
        self.sampling_params = SamplingParams(
            temperature=0.7, 
            top_p=0.9, 
            max_tokens=512,
            stop=["<|im_end|>", "<|endoftext|>"]
        )
        
        # Load Model ONCE
        self.llm = LLM(model=MODEL_NAME)

    @modal.method()
    def generate(self, payload: dict):
        """
        Pure Inference Endpoint.
        Accessible via modal.Cls.lookup("mw-inference", "Model")
        """
        prompt = payload.get("prompt")
        # We handle valid prompt check casually here, callers should validate
        if not prompt: 
            return {"error": "Prompt required"}

        # Generate
        outputs = self.llm.generate([prompt], self.sampling_params)
        
        # Parse output
        generated_text = outputs[0].outputs[0].text
        
        return {"response": generated_text}
