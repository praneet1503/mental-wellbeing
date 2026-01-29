"use client";

import { useState } from "react";
import type { Message } from "../../hooks/useChat";

const MEMORY_LIMIT = 20;

export default function ChatMemoryPanel({ messages }: { messages: Message[] }) {
  const memory = messages.slice(-MEMORY_LIMIT);
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside
      className={`border-l border-slate-200 bg-white/70 text-sm text-slate-700 md:sticky md:top-16 md:h-[calc(100vh-4rem)] ${
        isOpen
          ? "w-full max-w-sm px-4 py-6"
          : "w-12 max-w-[3rem] px-2 py-4"
      }`}
    >
      <div className={`flex items-center ${isOpen ? "justify-between" : "flex-col gap-3"}`}>
        {isOpen ? (
          <>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Memory (this chat)</h2>
              <p className="mt-1 text-xs text-slate-400">Last {MEMORY_LIMIT}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Collapse memory panel"
              aria-expanded={isOpen}
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12.78 4.22a.75.75 0 010 1.06L8.06 10l4.72 4.72a.75.75 0 11-1.06 1.06l-5.25-5.25a.75.75 0 010-1.06l5.25-5.25a.75.75 0 011.06 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Expand memory panel"
              aria-expanded={isOpen}
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M7.22 4.22a.75.75 0 011.06 0l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06L11.94 10 7.22 5.28a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 [writing-mode:vertical-rl] rotate-180">
              Memory
            </span>
          </>
        )}
      </div>

      {isOpen && (
        <>
          <p className="mt-3 text-xs text-slate-500">
            This memory exists only for this chat. Memory is cleared when chat ends.
          </p>
          <div className="mt-4 flex max-h-[60vh] flex-col gap-3 overflow-y-auto pr-1">
            {memory.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-400">
                Messages shared in this chat will appear here.
              </div>
            ) : (
              memory.map((message, index) => (
                <div
                  key={`${message.id}-${index}`}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2"
                >
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">
                    {message.role === "user" ? "You" : "Assistant"}
                  </div>
                  <div className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-700">
                    {message.content}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </aside>
  );
}
