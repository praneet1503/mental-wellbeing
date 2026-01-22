"use client";

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../lib/firebase";
import { Brain } from "lucide-react";

export default function Home() {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });

        return unsubscribe;
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Brain className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                            EchoMind
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        {currentUser ? (
                            <>
                                <Link href="/account" className="text-sm text-slate-600 hover:text-slate-900">Account</Link>
                                <Link href="/chat" className="text-sm text-slate-600 hover:text-slate-900">Chat</Link>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900">Log in</Link>
                                <Link href="/signup" className="text-sm text-slate-600 hover:text-slate-900">Sign up</Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="py-24 md:py-32 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
                            Welcome to <span className="text-primary">EchoMind</span>
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                            Create an account or log in to access your dashboard and chat.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/login" className="text-sm font-semibold text-primary hover:underline">
                                Log in
                            </Link>
                            <Link href="/signup" className="text-sm font-semibold text-primary hover:underline">
                                Sign up
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
