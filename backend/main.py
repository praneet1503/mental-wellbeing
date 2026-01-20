import os
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
import modal
from safety import analyze_safety, SafetyLevel, CRISIS_RESPONSE_TEXT
from prompts import build_prompt
from database import db
from auth import verify_api_key

# --- Initialization ---
app = FastAPI(title="Mental Wellbeing Backend (MVP)")

class ChatRequest(BaseModel):
    message: str
    user_id: str  # In real auth, this comes from the token

class ChatResponse(BaseModel):
    response: str
    safety_status: str

# --- Inference Client ---
# Connect to the deployed Modal class in the SEPARATE app
def call_inference_engine(prompt: str) -> str:
    try:
        # Lookup the separate application
        Model = modal.Cls.lookup("mw-inference", "Model")
        
        # Instantiate and call remote
        # Note: In Modal, calling the method on the class proxy executes it remotely
        result = Model().generate.remote({"prompt": prompt})
        
        # Handle dict response
        if isinstance(result, dict):
            if "error" in result:
                raise Exception(f"Inference Error: {result['error']}")
            return result["response"]
        return str(result)
        
    except modal.exception.NotFoundError:
        return "System Notification: The AI inference engine is currently offline. Please try again later."
    except Exception as e:
        print(f"Inference processing error: {e}")
        return "I'm having trouble thinking clearly right now. Can we pause for a moment?"

# --- Background Tasks ---
def update_long_term_memory(user_id: str):
    """
    Summarizes recent history and updates the user profile.
    This logic would ideally also use an LLM call.
    For this MVP, we perform a simple stub operation or a lightweight update.
    """
    history = db.get_chat_history(user_id, limit=20)
    # in a real app -> call LLM to summarize 'history'
    # db.update_user_summary(user_id, summarized_text)
    print(f"[Background] Updating summary for {user_id} based on {len(history)} messages.")

# --- Endpoints ---

@app.get("/health")
async def health():
    return {"status": "ok", "environment": "production-mvp"}

@app.post("/v1/chat", response_model=ChatResponse)
async def chat_endpoint(
    req: ChatRequest, 
    background_tasks: BackgroundTasks,
    api_key: str = Depends(verify_api_key) # Secure the gateway
):
    """
    Main Chat Loop: Validation -> Safety L3 -> DB -> Prompt -> Safety L2 -> Inference -> DB
    """
    user_id = req.user_id
    user_msg = req.message

    # 1. Safety Level 3 Check (Pre-check)
    safety_level, reason = analyze_safety(user_msg)
    
    if safety_level == SafetyLevel.CRISIS:
        # Deterministic Block
        return ChatResponse(
            response=CRISIS_RESPONSE_TEXT,
            safety_status="crisis_blocked"
        )
    
    # 2. Memory Retrieval
    history = db.get_chat_history(user_id, limit=10)
    summary = db.get_user_summary(user_id)
    
    # 3. Prompt Construction
    is_caution = (safety_level == SafetyLevel.CAUTION)
    full_prompt = build_prompt(history, summary, is_caution=is_caution)
    
    # Add current message to prompt
    full_prompt += f"<|im_start|>user\n{user_msg}<|im_end|>\n<|im_start|>assistant\n"

    # 4. Inference
    ai_text = call_inference_engine(full_prompt)
    
    # 5. Persistence
    db.save_message(user_id, "user", user_msg)
    db.save_message(user_id, "assistant", ai_text)
    
    # 6. Background Maintenance
    # Update summary occasionally (e.g., every 5 turns)
    if len(history) % 5 == 0:
        background_tasks.add_task(update_long_term_memory, user_id)

    return ChatResponse(
        response=ai_text,
        safety_status=safety_level.name
    )
