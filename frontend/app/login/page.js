"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

import { auth } from "../../lib/firebase";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { getApiBase } from "../../lib/apiBase";
import { useUserStore } from "../context/user-context";

export default function LoginPage() {
  const router = useRouter();
  const API_BASE = getApiBase();
  const { setUser } = useUserStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [preparing, setPreparing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/chat");
      }
    });
    return unsubscribe;
  }, [router]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const token = await credential.user.getIdToken();

      setPreparing(true);

      // Warm Modal container and validate API reachability
      await fetch(`${API_BASE}/health`).catch(() => null);

      const profileResponse = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (profileResponse.status === 404) {
        router.replace("/complete-profile");
        return;
      }

      if (!profileResponse.ok) {
        throw new Error("Profile check failed");
      }

      const profileData = await profileResponse.json();
      sessionStorage.setItem("echomind_user", JSON.stringify(profileData));

      setUser(profileData);
      router.replace("/chat");
    } catch (err) {
      if (err?.code === "auth/wrong-password" || err?.code === "auth/invalid-credential") {
        setError("Incorrect email or password.");
      } else if (err?.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else {
        setError("Unable to log in. Please try again.");
      }
    } finally {
      setLoading(false);
      setPreparing(false);
    }
  };

  if (preparing) {
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
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Log in to EchoMind</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-2 flex items-center text-slate-500 hover:text-slate-900"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-4 w-4"
                    >
                      <path
                        d="M3 3l18 18"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M10.58 10.58a2 2 0 102.83 2.83"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M9.88 4.24A10.43 10.43 0 0112 4c4.64 0 8.57 3.1 10 8-0.48 1.62-1.33 3.06-2.46 4.22"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M6.61 6.61C4.86 8.1 3.58 10.01 3 12c1.43 4.9 5.36 8 10 8 1.43 0 2.8-.3 4.06-.85"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-4 w-4"
                    >
                      <path
                        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 15a3 3 0 100-6 3 3 0 000 6Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </form>
          <p className="text-sm text-slate-500">
            Don&apos;t have an account? <Link href="/signup" className="text-primary">Sign up</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
