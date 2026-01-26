"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { getApiBase } from "../../lib/apiBase";

const UserContext = createContext(null);
const USER_CACHE_KEY = "echomind_user";

export function UserProvider({ children }) {
  const API_BASE = getApiBase();
  const [user, setUserState] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);
  const inFlight = useRef(false);

  const setUser = useCallback((nextUser) => {
    const resolved = nextUser || null;
    setUserState(resolved);
    setHasFetched(true);
    setError(null);
    if (typeof window !== "undefined") {
      if (resolved) {
        sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(resolved));
      } else {
        sessionStorage.removeItem(USER_CACHE_KEY);
      }
    }
  }, []);

  const clearUser = useCallback(() => {
    setUserState(null);
    setHasFetched(false);
    setError(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(USER_CACHE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem(USER_CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setUserState(parsed);
          setHasFetched(true);
        } catch {
          sessionStorage.removeItem(USER_CACHE_KEY);
        }
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        clearUser();
      }
    });

    return unsubscribe;
  }, [clearUser]);

  const ensureUser = useCallback(async () => {
    if (user || hasFetched || inFlight.current) {
      return;
    }

    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem(USER_CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setUserState(parsed);
          setHasFetched(true);
          return;
        } catch {
          sessionStorage.removeItem(USER_CACHE_KEY);
        }
      }
    }

    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      setError({ type: "auth", message: "Please log in to continue." });
      return;
    }

    setIsLoading(true);
    setError(null);
    inFlight.current = true;

    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        setError({ type: "auth", message: "Please log in to continue." });
        return;
      }

      if (response.status === 404) {
        setError({ type: "missing", message: "Please complete your profile." });
        return;
      }

      if (!response.ok) {
        throw new Error("Profile request failed");
      }

      const data = await response.json();
      setUserState(data || null);
      setHasFetched(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(data || null));
      }
    } catch (err) {
      setError({
        type: "network",
        message: "We couldn’t load your space right now. Please try again.",
      });
    } finally {
      setIsLoading(false);
      inFlight.current = false;
    }
  }, [API_BASE, hasFetched, user]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      error,
      hasFetched,
      setUser,
      clearUser,
      ensureUser,
    }),
    [user, isLoading, error, hasFetched, setUser, clearUser, ensureUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserStore() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserStore must be used within UserProvider");
  }
  return context;
}
