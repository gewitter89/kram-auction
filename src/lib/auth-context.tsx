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
  balance: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  updateBalance: (amount: number) => void;
  switchUser: (role: "BUYER" | "SELLER" | "ADMIN") => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Список доступных аккаунтов для быстрого тестирования и переключения
  const demoUsers: Record<string, User> = {
    BUYER: {
      id: "user-buyer",
      email: "demo-buyer@kram.ua",
      name: "Владимир (KRAM Buyer)",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      role: "BUYER",
      rating: 5.0,
      verified: true,
      balance: 150000
    },
    SELLER: {
      id: "user-seller",
      email: "demo-seller@kram.ua",
      name: "Александр (KRAM Seller)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      role: "SELLER",
      rating: 4.9,
      verified: true,
      balance: 250000
    },
    ADMIN: {
      id: "user-admin",
      email: "admin@kram.ua",
      name: "Главный Администратор",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      role: "ADMIN",
      rating: 5.0,
      verified: true,
      balance: 1000000
    }
  };

  useEffect(() => {
    // Восстанавливаем сохраненного пользователя при загрузке страницы
    const savedUser = localStorage.getItem("kram_current_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(demoUsers.BUYER);
      }
    } else {
      // По умолчанию входим как Покупатель
      setUser(demoUsers.BUYER);
      localStorage.setItem("kram_current_user", JSON.stringify(demoUsers.BUYER));
    }
    setLoading(false);
  }, []);

  const login = async (email: string): Promise<boolean> => {
    setLoading(true);
    let matchedUser = Object.values(demoUsers).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    // Если нет в списке демо, создаем нового временного покупателя
    if (!matchedUser) {
      matchedUser = {
        id: `user-${Date.now()}`,
        email: email,
        name: email.split("@")[0],
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?w=150`,
        role: "BUYER",
        rating: 5.0,
        verified: false,
        balance: 10000 // Начальный баланс новичка
      };
    }

    setUser(matchedUser);
    localStorage.setItem("kram_current_user", JSON.stringify(matchedUser));
    setLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("kram_current_user");
  };

  const updateBalance = (amount: number) => {
    if (!user) return;
    const updatedUser = { ...user, balance: user.balance + amount };
    setUser(updatedUser);
    localStorage.setItem("kram_current_user", JSON.stringify(updatedUser));
  };

  const switchUser = (role: "BUYER" | "SELLER" | "ADMIN") => {
    const selected = demoUsers[role];
    setUser(selected);
    localStorage.setItem("kram_current_user", JSON.stringify(selected));
    // Перезагрузка страницы для сброса стейта
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, updateBalance, switchUser, loading }}
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
