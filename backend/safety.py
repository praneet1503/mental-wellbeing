from enum import Enum
import re

class SafetyLevel(Enum):
    SAFE = 1        # Normal flow
    CAUTION = 2     # Passive ideation (Use stricter prompt)
    CRISIS = 3      # Active intent (Hard block)

# Hardcoded crisis response - Deterministic and safe
CRISIS_RESPONSE_TEXT = (
    "I'm very sorry you're going through this, but I'm an AI and I can't provide the help you need right now. "
    "If you are in danger or thinking about harming yourself, please call or text 988 (in the US) "
    "or go to the nearest emergency room immediately. You are not alone, and there is help available."
)

# Regex patterns for deterministic matching
# LEVEL 3: Active intent, immediate plan, or high urgency
CRISIS_PATTERNS = [
    r"\b(kill|hang|hurt|shoot|cut) myself\b",
    r"\b(suicide|end my life|want to die)\b",
    r"\b(take all the pills|jump off)\b",
    r"\b(better off dead)\b"
]

# LEVEL 2: Passive ideation, hopelessness, existential distress
CAUTION_PATTERNS = [
    r"\b(don't want to exist|wish I wasn't here|wish i was gone)\b",
    r"\b(feel empty|no point|hopeless)\b",
    r"\b(why bother|what's the use)\b",
    r"\b(depressed|lonely|sad)\b"
]

def analyze_safety(text: str) -> tuple[SafetyLevel, str]:
    """
    Analyzes input text for safety risks using deterministic regex.
    Returns (SafetyLevel, Reason/Context).
    """
    text_lower = text.lower()

    # Check Level 3 (Crisis) first
    for pattern in CRISIS_PATTERNS:
        if re.search(pattern, text_lower):
            return SafetyLevel.CRISIS, "Detected active self-harm intent."

    # Check Level 2 (Caution)
    for pattern in CAUTION_PATTERNS:
        if re.search(pattern, text_lower):
            return SafetyLevel.CAUTION, "Detected passive distress or hopelessness."

    return SafetyLevel.SAFE, "No immediate risks detected."
