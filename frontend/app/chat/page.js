'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

export default function ChatPage() {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadModels = async () => {
      try {
        const response = await fetch(`${API_BASE}/models`);
        if (!response.ok) {
          throw new Error('Failed to load models');
        }
        const data = await response.json();
        setModels(Array.isArray(data.models) ? data.models : []);
        if (Array.isArray(data.models) && data.models.length > 0) {
          setSelectedModel(data.models[0]);
        }
      } catch (err) {
        setError('Could not load models. Check the backend and API base URL.');
      }
    };

    loadModels();
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) {
      return;
    }
    setLoading(true);
    setError('');
    setReply('');

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          model: selectedModel || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const data = await response.json();
      setReply(data.reply || '');
    } catch (err) {
      setError('Unable to get a response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold">EchoMind</Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">Back to home</Link>
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
