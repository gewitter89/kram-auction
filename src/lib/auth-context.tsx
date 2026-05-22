"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: "BUYER" | "SELLER" | "ADMIN";
  rating: number;
  verified: boolean;
  verificationStep: number;
  balance: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateBalance: (amount: number) => Promise<void>;
  setVerificationStep: (step: number) => void;
  switchUser: (role: "BUYER" | "SELLER" | "ADMIN") => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (e) {
        console.error("Помилка перевірки сесії:", e);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const login = async (email: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setLoading(false);
        return true;
      }
    } catch (e) {
      console.error("Помилка авторизації:", e);
    }
    setLoading(false);
    return false;
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      setUser(null);
    } catch (e) {
      console.error("Помилка виходу:", e);
    }
    setLoading(false);
  };

  const updateBalance = async (_amount: number) => {
    // KRAM is now a free information platform and does not maintain user balances.
    return;
  };

  const setVerificationStep = (step: number) => {
    if (user) {
      setUser({ ...user, verificationStep: step });
    }
  };

  const switchUser = async (role: "BUYER" | "SELLER" | "ADMIN") => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "switch", role }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        // Перезавантажуємо сторінку для оновлення всього клієнтського стейту
        window.location.reload();
      }
    } catch (e) {
      console.error("Помилка зміни користувача:", e);
    }
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, updateBalance, setVerificationStep, switchUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
