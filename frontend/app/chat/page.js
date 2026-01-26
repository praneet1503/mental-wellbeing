"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { getApiBase } from "../../lib/apiBase";
import ChatLayout from "../../components/chat/ChatLayout";
import ChatMessages from "../../components/chat/ChatMessages";
import ChatInput from "../../components/chat/ChatInput";
import { useChat } from "../../hooks/useChat";
import { useUserStore } from "../context/user-context";
import PreparingSpaceOverlay, { READY_POLL_INTERVAL_MS } from "../../components/ritual/PreparingSpaceOverlay";

export default function ChatPage() {
  const router = useRouter();
  const API_BASE = getApiBase();
  const [authReady, setAuthReady] = useState(false);
  const [chatHistoryLoaded, setChatHistoryLoaded] = useState(false);
  const [llmReady, setLlmReady] = useState(false);
  const [safetyContextReady, setSafetyContextReady] = useState(false);
  const [systemPromptReady, setSystemPromptReady] = useState(false);
  const { user, hasFetched, ensureUser, error: userError } = useUserStore();
  const { messages, isSending, error, sendMessage } = useChat();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      setAuthReady(true);
    });

    return unsubscribe;
  }, [router]);

  useEffect(() => {
    if (!authReady) return;
    ensureUser();
  }, [authReady, ensureUser]);

  useEffect(() => {
    if (userError?.type === "auth") {
      router.replace("/login");
    }
    if (userError?.type === "missing") {
      router.replace("/complete-profile");
    }
  }, [router, userError]);

  useEffect(() => {
    if (!authReady) return;
    let active = true;
    const timer = setTimeout(() => {
      if (active) {
        setChatHistoryLoaded(true);
      }
    }, 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [authReady]);

  useEffect(() => {
    if (!authReady || llmReady) return;
    let active = true;

    const checkReadiness = async () => {
      try {
        const response = await fetch(`${API_BASE}/health`);
        if (!active) return;
        if (response.ok) {
          setLlmReady(true);
          setSafetyContextReady(true);
          setSystemPromptReady(true);
        }
      } catch {
        // Keep waiting; readiness must be true before we expand.
      }
    };

    checkReadiness();
    const interval = setInterval(checkReadiness, READY_POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [API_BASE, authReady, llmReady]);

  const userProfileLoaded = Boolean(user) && hasFetched;
  const isAppReady = useMemo(
    () =>
      chatHistoryLoaded &&
      userProfileLoaded &&
      llmReady &&
      safetyContextReady &&
      systemPromptReady,
    [chatHistoryLoaded, llmReady, safetyContextReady, systemPromptReady, userProfileLoaded]
  );

  if (!authReady) {
    return null;
  }

  return (
    <>
      <ChatLayout>
        <ChatMessages messages={messages} isSending={isSending} />
        {error && (
          <div className="mx-auto w-full max-w-3xl px-4 pb-2 text-xs text-red-600">
            {error}
          </div>
        )}
        <ChatInput onSend={sendMessage} isSending={isSending} />
      </ChatLayout>
      <PreparingSpaceOverlay isAppReady={isAppReady} />
    </>
  );
}
