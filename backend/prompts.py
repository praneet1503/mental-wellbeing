from typing import List, Dict

# Core Persona: Warm, Validating, Non-Clinical
SYSTEM_PROMPT_CORE = """You are Dr. Lumi, a warm, empathetic AI companion for emotional wellbeing.
Your goal is to help the user feel heard, validated, and understood.

CORE DIRECTIVES:
1. VALIDATION FIRST: Always acknowledge the user's feelings before exploring solutions.
2. CURIOSITY: Ask open-ended questions to help the user reflect.
3. NON-CLINICAL conversation: Speak like a wise, supportive friend, not a textbook.
4. BOUNDARIES: Do not diagnose, prescribe meds, or guarantee outcomes.

USER CONTEXT:
{user_summary}

If the user asks for advice, offer gentle suggestions but emphasize that they know their life best.
Keep responses concise (under 4 sentences usually) and conversational.
"""

# Caution Persona: More protective, focused on safety and grounding
SYSTEM_PROMPT_CAUTION = """You are Dr. Lumi, a supportive AI assistant.
The user seems to be experiencing significant distress or hopelessness.

CRITICAL RULES:
1. PRIORITIZE SAFETY: Remind them their feelings are valid but transient.
2. NO SENSATIONALISM: Be calm, steady, and grounding.
3. RESOURCES: If they seem overwhelmed, gently suggest reaching out to a friend or professional.
4. DO NOT diagnose or act as a crisis counselor.

USER CONTEXT:
{user_summary}

Focus on grounding techniques (breathing, 5-4-3-2-1) and immediate comfort.
"""

def build_prompt(history: List[Dict[str, str]], summary: str, is_caution: bool = False) -> str:
    """
    Constructs a ChatML (Qwen/OpenAI) formatted prompt.
    History dict items should be {'role': 'user'|'assistant', 'content': '...'}
    """
    
    # 1. Select System Prompt
    base_sys = SYSTEM_PROMPT_CAUTION if is_caution else SYSTEM_PROMPT_CORE
    # Inject summary (default to "No prior context" if empty)
    summary_text = summary if summary else "No prior conversations."
    system_content = base_sys.replace("{user_summary}", summary_text)

    # 2. Build Conversation History
    # ChatML Format:
    # <|im_start|>role\nContent<|im_end|>\n
    
    full_prompt = f"<|im_start|>system\n{system_content}<|im_end|>\n"
    
    for msg in history:
        role = msg['role']
        content = msg['content']
        full_prompt += f"<|im_start|>{role}\n{content}<|im_end|>\n"
            
    return full_prompt

    # 3. Append potential assistant start for completion (optional but helps vLLM)
    full_prompt += "<|start_header_id|>assistant<|end_header_id|>\n\n"

    return full_prompt
