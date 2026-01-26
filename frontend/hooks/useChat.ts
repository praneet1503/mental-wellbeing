"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { auth } from "../lib/firebase";
import { getApiBase } from "../lib/apiBase";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const trimmed = String(content || "").trim();
    if (!trimmed || isSending) return;
    if (trimmed.length > 4000) {
      setError("Message is too long. Please keep it under 4000 characters.");
      return;
    }

    setError(null);
    const userMessage: Message = { id: createId(), role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
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
        body: JSON.stringify({
          message: trimmed,
          conversation_id: conversationId || undefined,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `Request failed (${response.status})`);
      }

      const data = await response.json();
      if (!data || typeof data.reply !== "string") {
        throw new Error("Invalid response format");
      }

      if (typeof data.conversation_id === "string") {
        setConversationId(data.conversation_id);
      }

      const assistantMessage: Message = {
        id: createId(),
        role: "assistant",
        content: data.reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const fallback: Message = {
        id: createId(),
        role: "assistant",
        content: "Something went wrong. Please try again.",
      };
      setMessages((prev) => [...prev, fallback]);
      setError(typeof err?.message === "string" ? err.message : "Request failed");
    } finally {
      setIsSending(false);
    }
  }, [conversationId, isSending]);

  return {
    messages,
    isSending,
    error,
    sendMessage,
  };
}
