"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth } from "../../lib/firebase";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function AccountPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState("");
  const [quota, setQuota] = useState({ used: 0, limit: 25 });
  const [quotaError, setQuotaError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        const token = await user.getIdToken();
        localStorage.setItem("echomind_token", token);
        const response = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 404) {
          router.replace("/complete-profile");
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load profile");
        }

        const data = await response.json();
        setEmail(data.email || "");
        setUsername(data.username || "");
        setJoined(data.created_at || "");
        setQuota({
          used: Number(data.quota_used) || 0,
          limit: Number(data.quota_limit) || 25,
        });
      } catch (err) {
        setQuotaError("Unable to load quota.");
      }
    });

    return unsubscribe;
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("echomind_token");
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Your Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-slate-500">Email</p>
            <p className="font-medium">{email}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Username</p>
            <p className="font-medium">{username || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Date joined</p>
            <p className="font-medium">{joined || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Quota</p>
            {quotaError ? (
              <p className="text-red-600 text-sm">{quotaError}</p>
            ) : (
              <p className="font-medium">
                {quota.used} / {quota.limit}
              </p>
            )}
          </div>
          <Button onClick={handleLogout} className="w-full">
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
