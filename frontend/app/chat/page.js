'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { getApiBase } from '../../lib/apiBase';
import { useUserStore } from "../context/user-context";

const API_BASE = getApiBase();
const MODELS_CACHE_KEY = "echomind_models";

export default function ChatPage() {
  const router = useRouter();
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modelsLoading, setModelsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const { user, isLoading: userLoading, error: userError, hasFetched, ensureUser, setUser } = useUserStore();

  const getAuthToken = async () => {
    const authUser = auth.currentUser;
    if (!authUser) {
      return null;
    }
    return authUser.getIdToken();
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecking(false);
      if (!user) {
        router.replace('/login');
        return;
      }
    });

    return unsubscribe;
  }, [router]);

  useEffect(() => {
    if (!authChecking && currentUser) {
      ensureUser();
    }
  }, [authChecking, currentUser, ensureUser]);

  useEffect(() => {
    if (userError?.type === "auth") {
      router.replace('/login');
    }
    if (userError?.type === "missing") {
      router.replace('/complete-profile');
    }
  }, [userError, router]);

  useEffect(() => {
    const loadModelsAndQuota = async () => {
      setModelsLoading(true);
      try {
        const token = await getAuthToken();

        const cachedModels = sessionStorage.getItem(MODELS_CACHE_KEY);
        if (cachedModels) {
          const parsed = JSON.parse(cachedModels);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setModels(parsed);
            setSelectedModel(parsed[0]);
          }
        }

        if (cachedModels) {
          setModelsLoading(false);
          return;
        }

        const modelsResponse = await fetch(`${API_BASE}/models`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (modelsResponse.status === 401) {
          setError('Please log in to load models.');
          return;
        }

        if (!modelsResponse.ok) {
          throw new Error('Failed to load models');
        }

        const data = await modelsResponse.json();
        const modelList = Array.isArray(data.models) ? data.models : [];
        setModels(modelList);
        if (modelList.length > 0) {
          setSelectedModel(modelList[0]);
        }
        sessionStorage.setItem(MODELS_CACHE_KEY, JSON.stringify(modelList));
      } catch (err) {
        const msg = typeof err?.message === 'string' ? err.message : '';
        if (/Failed to fetch/i.test(msg)) {
          setError('Network error (often CORS or an HTTP→HTTPS redirect). Verify NEXT_PUBLIC_API_BASE is https and restart `npm run dev`.');
        } else {
          setError('Could not load models. Check the backend and API base URL.');
        }
      } finally {
        setModelsLoading(false);
      }
    };

    loadModelsAndQuota();
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) {
      return;
    }
    setLoading(true);
    setError('');
    setReply('');

    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message,
          model: selectedModel || undefined,
        }),
      });

      if (response.status === 401) {
        setError('Please log in to chat.');
        return;
      }

      if (response.status === 429) {
        setError('You have reached your usage limit');
        return;
      }

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const data = await response.json();
      setReply(data.reply || '');
      if (user) {
        setUser({
          ...user,
          quota_used: Number(user.quota_used ?? 0) + 1,
        });
      }
    } catch (err) {
      const msg = typeof err?.message === 'string' ? err.message : '';
      if (/Failed to fetch/i.test(msg)) {
        setError('Network error (often CORS or an HTTP→HTTPS redirect). Verify NEXT_PUBLIC_API_BASE is https and restart `npm run dev`.');
      } else {
        setError('Unable to get a response. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (userError && userError.type !== "auth" && userError.type !== "missing") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <p className="text-sm text-slate-600">{userError.message}</p>
          <Button onClick={ensureUser} className="px-6">
            Try again
          </Button>
          <div>
            <Link href="/login" className="text-sm text-slate-500 hover:text-slate-900">
              Go to log in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPreparing = authChecking || (!user && !hasFetched) || (userLoading && !user) || modelsLoading;

  if (isPreparing) {
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold">EchoMind</Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">Back to home</Link>
            {currentUser ? (
              <Link href="/account" className="text-sm text-slate-500 hover:text-slate-900">Account</Link>
            ) : (
              <Link href="/login" className="text-sm text-slate-500 hover:text-slate-900">Log in</Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Model</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Share how you're feeling..."
                rows={5}
              />
            </div>

            <Button onClick={sendMessage} disabled={loading} className="w-full">
              {loading ? 'Sending...' : 'Send'}
            </Button>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {user && (
              <p className="text-xs text-slate-500">
                Messages left: {Math.max(0, Number(user.quota_limit ?? 25) - Number(user.quota_used ?? 0))}
              </p>
            )}

            {reply && (
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-slate-700">
                {reply}
              </div>
            )}

          </CardContent>
        </Card>
      </main>
    </div>
  );
}
