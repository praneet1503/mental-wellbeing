from typing import List, Dict, Optional
import datetime

# --- MOCK DATABASE INTERFACE --- 
# In a real production app, replace 'data_store' with SQLAlchemy models/sessions.
# For 5-Day MVP, in-memory/simple methods are enough to demonstrate the architecture 
# without needing a live Postgres connection in this restricted env.

class Database:
    def __init__(self):
        # keyed by user_id
        self.summaries: Dict[str, str] = {}
        self.histories: Dict[str, List[Dict[str, str]]] = {}

    def get_user_summary(self, user_id: str) -> str:
        return self.summaries.get(user_id, "")

    def update_user_summary(self, user_id: str, new_summary: str):
        self.summaries[user_id] = new_summary

    def get_chat_history(self, user_id: str, limit: int = 10) -> List[Dict[str, str]]:
        # Returns list of {'role': '...', 'content': '...'}
        history = self.histories.get(user_id, [])
        return history[-limit:]

    def save_message(self, user_id: str, role: str, content: str):
        if user_id not in self.histories:
            self.histories[user_id] = []
        
        self.histories[user_id].append({
            "role": role,
            "content": content,
            "timestamp": datetime.datetime.now().isoformat()
        })

# Singleton instance for the MVP
db = Database()
