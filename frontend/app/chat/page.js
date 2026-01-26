"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import ChatLayout from "../../components/chat/ChatLayout";
import ChatMessages from "../../components/chat/ChatMessages";
import ChatInput from "../../components/chat/ChatInput";
import { useChat } from "../../hooks/useChat";

export default function ChatPage() {
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);
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

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-11 w-11 rounded-full border border-slate-200 bg-white shadow-sm animate-pulse motion-reduce:animate-none" />
          <p className="text-sm text-slate-600" aria-live="polite">Preparing your space…</p>
        </div>
      </div>
    );
  }

  return (
    <ChatLayout>
      <ChatMessages messages={messages} isSending={isSending} />
      {error && (
        <div className="mx-auto w-full max-w-3xl px-4 pb-2 text-xs text-red-600">
          {error}
        </div>
      )}
      <ChatInput onSend={sendMessage} isSending={isSending} />
    </ChatLayout>
  );
}
