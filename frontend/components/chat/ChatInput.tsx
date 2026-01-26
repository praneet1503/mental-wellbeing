"use client";

import { useState } from "react";
import { Button } from "../ui/button";

const MAX_MESSAGE_LENGTH = 4000;

export default function ChatInput({ onSend, isSending }: { onSend: (message: string) => void; isSending: boolean }) {
  const [value, setValue] = useState("");

  const handleSend = async () => {
    const trimmed = value.trim();
    if (!trimmed || isSending) return;
    await onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!isSending) {
        handleSend();
      }
    }
  };

  const overLimit = value.length > MAX_MESSAGE_LENGTH;

  return (
    <div className="sticky bottom-0 border-t bg-white/95 backdrop-blur px-4 py-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-2">
        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <textarea
            className="min-h-[88px] w-full resize-none bg-transparent text-sm text-slate-900 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="Message EchoMind..."
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            aria-label="Chat message"
          />
          <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
            <span>Enter to send · Shift+Enter for new line</span>
            <span>{value.length}/{MAX_MESSAGE_LENGTH}</span>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Button onClick={handleSend} disabled={isSending || !value.trim() || overLimit}>
            {isSending ? "Sending..." : "Send"}
          </Button>
        </div>
        {overLimit && (
          <p className="text-xs text-red-600">Message is too long. Max 4000 characters.</p>
        )}
      </div>
    </div>
  );
}
