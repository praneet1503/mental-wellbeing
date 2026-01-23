'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { getApiBase } from '../../lib/apiBase';

const API_BASE = getApiBase();

export default function ChatPage() {
  const router = useRouter();
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [messagesLeft, setMessagesLeft] = useState(null);
  const [origin, setOrigin] = useState('');
  const debugEnabled = process.env.NODE_ENV !== 'production';

  useEffect(() => {
    setOrigin(window.location.origin);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        router.replace('/login');
        return;
      }
    });

    return unsubscribe;
  }, [router]);

  useEffect(() => {
    const loadModelsAndQuota = async () => {
      try {
        const token = localStorage.getItem('echomind_token');
        const response = await fetch(`${API_BASE}/models`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (response.status === 401) {
          setError('Please log in to load models.');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to load models');
        }
        const data = await response.json();
        setModels(Array.isArray(data.models) ? data.models : []);
        if (Array.isArray(data.models) && data.models.length > 0) {
          setSelectedModel(data.models[0]);
        }

        if (token) {
          const usageResponse = await fetch(`${API_BASE}/usage`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (usageResponse.ok) {
            const usageData = await usageResponse.json();
            const used = Number(usageData.used) || 0;
            const limit = Number(usageData.limit) || 25;
            setMessagesLeft(Math.max(limit - used, 0));
          }
        }
      } catch (err) {
        const msg = typeof err?.message === 'string' ? err.message : '';
        if (/Failed to fetch/i.test(msg)) {
          setError('Network error (often CORS or an HTTP→HTTPS redirect). Verify NEXT_PUBLIC_API_BASE is https and restart `npm run dev`.');
        } else {
          setError('Could not load models. Check the backend and API base URL.');
        }
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
      const token = localStorage.getItem('echomind_token');
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
      if (messagesLeft !== null) {
        setMessagesLeft(Math.max(messagesLeft - 1, 0));
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
            {debugEnabled && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <div><span className="font-medium">Debug</span> (dev only)</div>
                <div suppressHydrationWarning>Origin: {origin}</div>
                <div>API base: {API_BASE}</div>
              </div>
            )}

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

            {reply && (
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-slate-700">
                {reply}
              </div>
            )}

            {messagesLeft !== null && (
              <p className="text-sm text-slate-500">{messagesLeft} messages left</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
