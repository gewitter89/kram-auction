"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiService } from "@/lib/api-service";
import { 
  Bell, 
  MessageSquare, 
  Plus, 
  User as UserIcon, 
  ChevronDown, 
  Wallet, 
  LogOut, 
  CheckCircle,
  ShieldAlert,
  Search,
  Gem
} from "lucide-react";
import { MockNotification } from "@/lib/db";

export default function Navbar() {
  const { user, login, logout, switchUser } = useAuth();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<MockNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);

  useEffect(() => {
    // Инициализируем API и получаем уведомления
    apiService.initialize();
    if (user) {
      setNotifications(apiService.getNotifications(user.id));
      
      // Периодическое обновление уведомлений для имитации реального времени
      const timer = setInterval(() => {
        setNotifications(apiService.getNotifications(user.id));
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = () => {
    if (user) {
      apiService.markNotificationsAsRead(user.id);
      setNotifications(apiService.getNotifications(user.id));
    }
  };

  const navLinks = [
    { href: "/", label: "Главная" },
    { href: "/catalog", label: "Каталог" },
    { href: "/messages", label: "Чат" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Логотип */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-transform group-hover:scale-105">
              <Gem className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white font-display">
                KRAM<span className="text-emerald-500 text-glow-emerald">.UA</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">Marketplace</span>
            </div>
          </Link>

          {/* Ссылки навигации */}
          <nav className="hidden md:flex gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-emerald-400 ${
                    isActive ? "text-emerald-500 text-glow-emerald" : "text-slate-300"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Правая часть: Уведомления, Баланс, Профиль */}
        <div className="flex items-center gap-4">
          
          {/* Баланс пользователя */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/5 px-3 py-1.5 border border-white/10 shadow-inner">
              <Wallet className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-slate-400">Баланс:</span>
              <span className="text-sm font-semibold text-emerald-400">
                {user.balance.toLocaleString()} UAH
              </span>
            </div>
          )}

          {/* Уведомления */}
          {user && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                  if (!showNotifications) handleMarkAsRead();
                }}
                className="relative rounded-xl border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-all"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Выпадающий список уведомлений */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                    <h3 className="font-semibold text-sm text-white">Уведомления</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs text-emerald-400">{unreadCount} новых</span>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-center py-4 text-xs text-slate-500">Уведомлений нет</p>
                    ) : (
                      notifications.map((not) => (
                        <div
                          key={not.id}
                          className={`rounded-lg p-2.5 text-xs transition-colors ${
                            not.isRead ? "bg-white/[0.02] text-slate-400" : "bg-emerald-500/[0.04] text-slate-200 border-l-2 border-emerald-500"
                          }`}
                        >
                          <p className="leading-relaxed">{not.text}</p>
                          <span className="text-[10px] text-slate-500 block mt-1">
                            {new Date(not.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Сообщения */}
          {user && (
            <Link
              href="/messages"
              className="rounded-xl border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-all"
            >
              <MessageSquare className="h-5 w-5" />
            </Link>
          )}

          {/* Профиль пользователя */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 rounded-xl border border-white/10 p-1.5 hover:bg-white/5 transition-all text-left"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-7 w-7 rounded-lg object-cover ring-1 ring-emerald-500/30"
                />
                <div className="hidden lg:block text-xs pr-1">
                  <p className="font-medium text-white max-w-[120px] truncate">{user.name}</p>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                    {user.verified && <CheckCircle className="h-2.5 w-2.5 text-emerald-400 fill-emerald-500/20" />}
                    Рейтинг {user.rating.toFixed(1)}
                  </p>
                </div>
                <ChevronDown className="h-3 w-3 text-slate-500" />
              </button>

              {/* Меню профиля */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-slate-900 p-2 shadow-xl">
                  <div className="px-3 py-2 border-b border-white/5">
                    <p className="text-xs text-slate-400">Вы вошли как:</p>
                    <p className="font-semibold text-sm text-white truncate">{user.name}</p>
                    <span className="inline-block mt-1 rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-slate-300">
                      {user.role}
                    </span>
                  </div>
                  
                  <div className="py-1">
                    <Link
                      href="/sell"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Plus className="h-4 w-4 text-emerald-400" />
                      Разместить лот
                    </Link>
                    <button
                      onClick={() => {
                        setShowSwitcher(true);
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-left"
                    >
                      <ShieldAlert className="h-4 w-4 text-amber-400" />
                      Смена роли (Тест)
                    </button>
                  </div>

                  <div className="border-t border-white/5 pt-1 mt-1">
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Выйти
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => login("demo-buyer@kram.ua")}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-all"
            >
              Войти
            </button>
          )}

          {/* Кнопка Создать лот */}
          <Link
            href="/sell"
            className="hidden md:flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:from-emerald-400 hover:to-teal-500 transition-all border border-emerald-400/20"
          >
            <Plus className="h-4 w-4" />
            Разместить лот
          </Link>
        </div>
      </div>

      {/* Всплывающий виджет быстрой смены аккаунта (для демонстрации) */}
      {showSwitcher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-80 rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Режим тестирования KRAM</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Быстро переключайтесь между ролями, чтобы протестировать торги, уведомления и логику безопасной сделки с Новой Почтой.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => switchUser("BUYER")}
                className={`w-full rounded-xl px-4 py-3 text-xs font-medium text-left border flex items-center justify-between transition-all ${
                  user?.role === "BUYER" ? "border-emerald-500 bg-emerald-500/10 text-white" : "border-white/5 bg-white/[0.02] text-slate-300 hover:bg-white/5"
                }`}
              >
                <span>Владимир (Покупатель)</span>
                <span className="text-[10px] text-emerald-400">150K UAH</span>
              </button>
              <button
                onClick={() => switchUser("SELLER")}
                className={`w-full rounded-xl px-4 py-3 text-xs font-medium text-left border flex items-center justify-between transition-all ${
                  user?.role === "SELLER" ? "border-emerald-500 bg-emerald-500/10 text-white" : "border-white/5 bg-white/[0.02] text-slate-300 hover:bg-white/5"
                }`}
              >
                <span>Александр (Продавец)</span>
                <span className="text-[10px] text-emerald-400">250K UAH</span>
              </button>
              <button
                onClick={() => switchUser("ADMIN")}
                className={`w-full rounded-xl px-4 py-3 text-xs font-medium text-left border flex items-center justify-between transition-all ${
                  user?.role === "ADMIN" ? "border-emerald-500 bg-emerald-500/10 text-white" : "border-white/5 bg-white/[0.02] text-slate-300 hover:bg-white/5"
                }`}
              >
                <span>Администратор KRAM</span>
                <span className="text-[10px] text-emerald-400">1M UAH</span>
              </button>
            </div>
            <button
              onClick={() => setShowSwitcher(false)}
              className="mt-4 w-full rounded-xl border border-white/10 py-2.5 text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
