"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth } from "../../lib/firebase";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useUserStore } from "../context/user-context";

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading, error, ensureUser, clearUser } = useUserStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      await ensureUser();
    });

    return unsubscribe;
  }, [router, ensureUser]);

  useEffect(() => {
    if (error?.type === "auth") {
      router.replace("/login");
    }
    if (error?.type === "missing") {
      router.replace("/complete-profile");
    }
  }, [error, router]);

  const handleLogout = async () => {
    await signOut(auth);
    clearUser();
    router.replace("/login");
  };

  if (isLoading && !user) {
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Your Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-slate-500">Email</p>
            <p className="font-medium">{user?.email || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Username</p>
            <p className="font-medium">{user?.username || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Date joined</p>
            <p className="font-medium">{user?.created_at || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Quota</p>
            {error && error.type !== "auth" && error.type !== "missing" ? (
              <p className="text-red-600 text-sm">{error.message}</p>
            ) : (
              <p className="font-medium">
                {Number(user?.quota_used ?? 0)} / {Number(user?.quota_limit ?? 25)}
              </p>
            )}
          </div>
          <Button onClick={() => router.push("/chat")} className="w-full" variant="secondary">
            Go to chat
          </Button>
          <Button onClick={handleLogout} className="w-full">
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
