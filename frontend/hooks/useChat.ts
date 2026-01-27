"use client";

import { create } from "zustand";
import { auth } from "../lib/firebase";
import { getApiBase } from "../lib/apiBase";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatState = {
  sessionId: string | null;
  messages: Message[];
  isSending: boolean;
  error: string | null;
  abortController: AbortController | null;
  initializeSession: () => void;
  sendMessage: (content: string) => Promise<void>;
  endChat: () => Promise<void>;
};

const MAX_MESSAGE_LENGTH = 4000;

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createSessionId() {
  return crypto.randomUUID();
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessionId: null,
  messages: [],
  isSending: false,
  error: null,
  abortController: null,
  initializeSession: () => {
    if (!get().sessionId) {
      set({ sessionId: createSessionId() });
    }
  },
  sendMessage: async (content: string) => {
    const trimmed = String(content || "").trim();
    if (!trimmed || get().isSending) return;
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      set({ error: "Message is too long. Please keep it under 4000 characters." });
      return;
    }

    const sessionId = get().sessionId ?? createSessionId();
    set({ sessionId, error: null });

    const userMessage: Message = { id: createId(), role: "user", content: trimmed };
    set((state) => ({ messages: [...state.messages, userMessage], isSending: true }));

    get().abortController?.abort();
    const controller = new AbortController();
    set({ abortController: controller });

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Not authenticated");
      }

      const token = await user.getIdToken();
      const API_BASE = getApiBase();

      const response = await fetch(`${API_BASE}/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: trimmed,
          session_id: sessionId,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let detail = "";
        try {
          const data = await response.json();
          if (data && typeof data.detail === "string") {
            detail = data.detail;
          }
        } catch {
          detail = await response.text().catch(() => "");
        }

        if (response.status === 429) {
          throw new Error("You have reached your usage limit. Please return tomorrow or check your account for details.");
        }

        if (detail) {
          throw new Error(detail);
        }

        throw new Error(`Request failed (${response.status})`);
      }

      const data = await response.json();
      if (!data || typeof data.reply !== "string") {
        throw new Error("Invalid response format");
      }

      const assistantMessage: Message = {
        id: createId(),
        role: "assistant",
        content: data.reply,
      };
      set((state) => ({ messages: [...state.messages, assistantMessage] }));
    } catch (err: any) {
      const messageText =
        typeof err?.message === "string" && err.message.trim()
          ? err.message
          : "Something went wrong. Please try again.";
      const fallback: Message = {
        id: createId(),
        role: "assistant",
        content: messageText,
      };
      set((state) => ({ messages: [...state.messages, fallback], error: messageText }));
    } finally {
      set({ isSending: false });
    }
  },
  endChat: async () => {
    const sessionId = get().sessionId;
    const API_BASE = getApiBase();

    if (sessionId) {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error("Not authenticated");
        }
        const token = await user.getIdToken();
        await fetch(`${API_BASE}/chat/session`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ session_id: sessionId }),
        });
      } catch {
        // Graceful failure: keep UI responsive and reset locally.
      }
    }

    set({ messages: [], sessionId: createSessionId(), error: null });
  },
}));

export function useChat() {
  const { sessionId, messages, isSending, error, initializeSession, sendMessage, endChat } = useChatStore();
  return { sessionId, messages, isSending, error, initializeSession, sendMessage, endChat };
}
