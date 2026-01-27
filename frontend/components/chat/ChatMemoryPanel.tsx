"use client";

import type { Message } from "../../hooks/useChat";

const MEMORY_LIMIT = 20;

export default function ChatMemoryPanel({ messages }: { messages: Message[] }) {
  const memory = messages.slice(-MEMORY_LIMIT);

  return (
    <aside className="w-full max-w-sm border-l border-slate-200 bg-white/70 px-4 py-6 text-sm text-slate-700 md:sticky md:top-16 md:h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Memory (this chat)</h2>
        <span className="text-xs text-slate-400">Last {MEMORY_LIMIT}</span>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        This memory exists only for this chat. Memory is cleared when chat ends.
      </p>
      <div className="mt-4 flex max-h-[60vh] flex-col gap-3 overflow-y-auto pr-1">
        {memory.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-400">
            Messages shared in this chat will appear here.
          </div>
        ) : (
          memory.map((message, index) => (
            <div key={`${message.id}-${index}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
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
    </aside>
  );
}
