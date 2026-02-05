"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Home() {
    const shouldReduceMotion = useReducedMotion();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const fadeInUp = {
        initial: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: shouldReduceMotion ? 0 : 0.5, ease: "easeOut" },
        viewport: { once: true, amount: 0.6 },
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(Boolean(user));
        });

        return unsubscribe;
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-semibold tracking-tight text-slate-900">
                            EchoMind
                        </span>
                    </div>
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <Link
                                href="/account"
                                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                Account
                            </Link>
                            <Link
                                href="/chat"
                                className="text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-full px-4 py-2 transition-colors"
                            >
                                Go to chat
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link
                                href="/login"
                                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/signup"
                                className="text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-full px-4 py-2 transition-colors"
                            >
                                Create account
                            </Link>
                        </div>
                    )}
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="py-24 md:py-32 bg-gradient-to-br from-slate-50 via-white to-slate-100">
                    <div className="container mx-auto px-4 text-center">
                        <motion.h1
                            className="text-4xl md:text-6xl font-semibold tracking-tight text-slate-900 mb-6"
                            {...fadeInUp}
                        >
                            A calm place to talk things through — and feel heard.
                        </motion.h1>
                        <motion.p
                            className="text-lg md:text-xl text-slate-600 mb-4 max-w-2xl mx-auto"
                            {...fadeInUp}
                        >
                            Reflect, express, and untangle your thoughts through calm, thoughtful conversation —
                            whenever you need a steady space.
                        </motion.p>
                        <motion.p
                            className="text-sm md:text-base text-slate-500 mb-10"
                            {...fadeInUp}
                        >
                            Designed to support reflection over time, not quick answers.
                        </motion.p>
                        {isAuthenticated ? (
                            <motion.div
                                className="flex flex-col sm:flex-row items-center justify-center gap-4"
                                {...fadeInUp}
                            >
                                <Link
                                    href="/chat"
                                    className="text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-full px-6 py-3 transition-colors"
                                >
                                    Go to chat
                                </Link>
                                <Link
                                    href="/account"
                                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                                >
                                    Account
                                </Link>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="flex flex-col sm:flex-row items-center justify-center gap-4"
                                {...fadeInUp}
                            >
                                <Link
                                    href="/signup"
                                    className="text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-full px-6 py-3 transition-colors"
                                >
                                    Create your account
                                </Link>
                                <Link
                                    href="/login"
                                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                                >
                                    Log in
                                </Link>
                            </motion.div>
                        )}
                        <motion.p className="mt-6 text-xs text-slate-500" {...fadeInUp}>
                             Private by design · Encourages outside support when needed
                        </motion.p>
                    </div>
                </section>

                {/* Trust / Safety */}
                <section className="py-12 md:py-16">
                    <div className="container mx-auto px-4 max-w-3xl text-center">
                        <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                            EchoMind is designed for reflection and emotional clarity. It is not a substitute
                            for professional care. If you ever need more support, we encourage reaching out to
                            trusted people or qualified professionals. Conversations are private and handled with care.
                        </p>
                    </div>
                </section>
            </main>

            <footer className="py-10 border-t border-slate-100">
                <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
                    <span>EchoMind © {new Date().getFullYear()}</span>
                    <div className="flex items-center gap-4">
                        <Link href="/privacy" className="hover:text-slate-700 transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="hover:text-slate-700 transition-colors">
                            Terms
                        </Link>
                        <Link href="/disclaimer" className="hover:text-slate-700 transition-colors">
                            Disclaimer
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
