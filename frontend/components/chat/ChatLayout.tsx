"use client";

import Link from "next/link";
import { Button } from "../ui/button";

export default function ChatLayout({
  children,
  onNewChat,
  isSending,
}: {
  children: React.ReactNode;
  onNewChat?: () => void;
  isSending?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-semibold text-slate-900">EchoMind</Link>
            <span className="text-xs text-slate-400">Chat</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {onNewChat && (
              <Button variant="outline" size="sm" onClick={onNewChat} disabled={isSending}>
                New chat
              </Button>
            )}
            <Link href="/account" className="text-slate-500 hover:text-slate-900">Account</Link>
            <Link href="/" className="text-slate-500 hover:text-slate-900">Home</Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
