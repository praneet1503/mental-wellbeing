"use client";

import { useEffect, useRef } from "react";
import type { Message } from "../../hooks/useChat";

export default function ChatMessages({ messages, isSending }: { messages: Message[]; isSending: boolean }) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        {messages.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-500">
            This is a safe place.
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={
                message.role === "user"
                  ? "max-w-[80%] rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-sm"
                  : "max-w-[80%] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm"
              }
            >
              <div className="whitespace-pre-wrap leading-6">{message.content}</div>
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
              Typing…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
