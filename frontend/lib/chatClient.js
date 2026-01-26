import { auth } from "./firebase";
import { getApiBase } from "./apiBase";

export async function sendChatMessage(message) {
  const trimmed = String(message || "").trim();
  if (!trimmed) {
    throw new Error("Message is empty");
  }

  const user = auth.currentUser;
  if (!user) {
    throw new Error("Not authenticated");
  }

  const token = await user.getIdToken();
  const API_BASE = getApiBase();

  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message: trimmed }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Request failed (${response.status})`);
  }

  const data = await response.json();
  if (!data || typeof data.reply !== "string") {
    throw new Error("Invalid response format");
  }

  return data.reply;
}
