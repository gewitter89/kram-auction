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
  Gem,
  Volume2,
  VolumeX
} from "lucide-react";
import { MockNotification } from "@/lib/db";
import { soundService } from "@/lib/sound-service";

export default function Navbar() {
  const { user, login, logout, switchUser } = useAuth();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<MockNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(soundService.getMuteState());
  }, []);

  const handleToggleMute = () => {
    const nextMute = soundService.toggleMute();
    setIsMuted(nextMute);
    if (!nextMute) {
      soundService.playClick();
    }
  };

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
    { href: "/", label: "Головна" },
    { href: "/catalog", label: "Каталог" },
    { href: "/messages", label: "Чат" },
  ];

  if (user) {
    navLinks.push({ href: "/dashboard", label: "Аналітика" });
  }
  if (user && user.role === "ADMIN") {
    navLinks.push({ href: "/admin", label: "Адмін-Консоль" });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
      {/* Live top banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-violet-500/10 to-emerald-500/10 border-b border-white/5 py-1 text-center text-[9px] uppercase tracking-widest text-slate-400 font-semibold flex items-center justify-center gap-4">
        <span>🔒 Secure KRAM Protocol v1.4</span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:inline">⚡ Live WebSockets: Connected</span>
        <span className="hidden sm:inline">•</span>
        <span className="text-emerald-400">🛡️ Anti-Fraud Active</span>
      </div>

      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Логотип */}
        <div className="flex items-center gap-8">
          <Link 
            href="/" 
            className="flex items-center gap-2 group"
            onMouseEnter={() => soundService.playHover()}
            onClick={() => soundService.playClick()}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-700 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-transform group-hover:scale-105">
              <Gem className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white font-display">
                KRAM<span className="text-emerald-400 text-glow-emerald">.UA</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">Online Auctions</span>
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
                  className={`text-xs font-semibold uppercase tracking-wider transition-colors hover:text-emerald-400 ${
                    isActive ? "text-emerald-400 text-glow-emerald" : "text-slate-400"
                  }`}
                  onMouseEnter={() => soundService.playHover()}
                  onClick={() => soundService.playClick()}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Правая часть: Звук, Уведомления, Баланс, Профиль */}
        <div className="flex items-center gap-4">
          
          {/* Звуковой тумблер */}
          <button
            onClick={handleToggleMute}
            onMouseEnter={() => soundService.playHover()}
            className={`rounded-xl border p-2 text-slate-400 hover:text-white transition-all ${
              isMuted ? "border-white/5 hover:bg-white/5" : "border-emerald-500/25 bg-emerald-500/5 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
            }`}
            title={isMuted ? "Увімкнути звук" : "Вимкнути звук"}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-slate-500" /> : <Volume2 className="h-4 w-4 text-emerald-400 animate-pulse" />}
          </button>

          {/* Баланс користувача */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/5 px-3 py-1.5 border border-white/10 shadow-inner">
              <Wallet className="h-4 w-4 text-emerald-400" />
              <span className="text-[10px] uppercase font-bold text-slate-500">Баланс:</span>
              <span className="text-xs font-extrabold text-emerald-400">
                {user.balance.toLocaleString()} UAH
              </span>
            </div>
          )}

          {/* Сповіщення */}
          {user && (
            <div className="relative">
              <button
                onClick={() => {
                  soundService.playClick();
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                  if (!showNotifications) handleMarkAsRead();
                }}
                onMouseEnter={() => soundService.playHover()}
                className="relative rounded-xl border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-all"
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Випадаючий список сповіщень */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                    <h3 className="font-semibold text-xs text-white uppercase tracking-wider">Сповіщення</h3>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold text-emerald-400">{unreadCount} нових</span>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-center py-4 text-xs text-slate-500">Немає сповіщень</p>
                    ) : (
                      notifications.map((not) => (
                        <div
                          key={not.id}
                          className={`rounded-xl p-2.5 text-xs transition-colors ${
                            not.isRead ? "bg-white/[0.01] text-slate-400" : "bg-emerald-500/[0.04] text-slate-200 border-l-2 border-emerald-500"
                          }`}
                        >
                          <p className="leading-relaxed">{not.text}</p>
                          <span className="text-[9px] text-slate-500 block mt-1">
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
              onMouseEnter={() => soundService.playHover()}
              onClick={() => soundService.playClick()}
              className="rounded-xl border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-all"
            >
              <MessageSquare className="h-4.5 w-4.5" />
            </Link>
          )}

          {/* Профиль пользователя */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  soundService.playClick();
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                onMouseEnter={() => soundService.playHover()}
                className="flex items-center gap-2 rounded-xl border border-white/10 p-1.5 hover:bg-white/5 transition-all text-left animate-fade-in"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-7 w-7 rounded-lg object-cover ring-1 ring-emerald-500/30"
                />
                <div className="hidden lg:block text-xs pr-1">
                  <p className="font-semibold text-white max-w-[120px] truncate">{user.name}</p>
                  <p className="text-[9px] text-emerald-400 flex items-center gap-1">
                    {user.verified && <CheckCircle className="h-2.5 w-2.5 text-emerald-400 fill-emerald-500/20" />}
                    Рейтинг {user.rating.toFixed(1)}
                  </p>
                </div>
                <ChevronDown className="h-3 w-3 text-slate-500" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-slide-up">
                  <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                    <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                    <p className="text-[9px] text-slate-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                      {user.role === "ADMIN" ? "Адміністратор" : user.role === "SELLER" ? "Продавець" : "Покупець"}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      soundService.playClick();
                      setShowSwitcher(!showSwitcher);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <span>Змінити роль</span>
                    <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${showSwitcher ? 'rotate-180' : ''}`} />
                  </button>

                  {showSwitcher && (
                    <div className="px-2 py-1.5 my-1 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      {(["BUYER", "SELLER", "ADMIN"] as const).map((role) => (
                        <button
                          key={role}
                          onClick={() => {
                            soundService.playClick();
                            switchUser(role);
                            setShowProfileMenu(false);
                            setShowSwitcher(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-2 py-1 text-[10px] uppercase font-bold transition-all ${
                            user.role === role
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                          }`}
                        >
                          <span>{role === "ADMIN" ? "Адмін" : role === "SELLER" ? "Продавець" : "Покупець"}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {user.role !== "BUYER" && (
                    <Link
                      href="/sell"
                      onClick={() => {
                        soundService.playClick();
                        setShowProfileMenu(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Створити лот</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      soundService.playClick();
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors mt-1 border-t border-white/5 pt-2"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Вийти</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                soundService.playClick();
                login("demo-buyer@kram.ua");
              }}
              onMouseEnter={() => soundService.playHover()}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:brightness-110 active:scale-95 transition-all"
            >
              Увійти
            </button>
          )}

          {/* Кнопка "Створити лот" для продавцов / админов */}
          {user && (user.role === "SELLER" || user.role === "ADMIN") && (
            <Link
              href="/sell"
              onMouseEnter={() => soundService.playHover()}
              onClick={() => soundService.playClick()}
              className="hidden sm:flex items-center gap-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 px-3.5 py-2 text-xs font-extrabold text-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            >
              <Plus className="h-4 w-4" />
              <span>Додати лот</span>
            </Link>
          )}

        </div>
      </div>
    </header>
  );
}
