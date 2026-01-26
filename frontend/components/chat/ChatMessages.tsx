"use client";

import { useEffect, useRef } from "react";
import type { Message } from "../../hooks/useChat";

export default function ChatMessages({ messages, isSending }: { messages: Message[]; isSending: boolean }) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={
                message.role === "user"
                  ? "max-w-[80%] rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white"
                  : "max-w-[80%] rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-900"
              }
            >
              {message.content}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
              Typing…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
