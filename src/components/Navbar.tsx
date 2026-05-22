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
  ChevronDown, 
  LogOut, 
  CheckCircle,
  Gem,
  Volume2,
  VolumeX,
  Palette,
  Menu,
  X,
  Trophy,
  LayoutDashboard,
  ShieldCheck,
  Home,
  BookOpen
} from "lucide-react";
import { soundService } from "@/lib/sound-service";
import { Notification } from "@prisma/client";


export default function Navbar() {
  const { user, login, logout, switchUser } = useAuth();
  const handleGoogleLogin = () => {
    soundService.playClick();
    window.location.href = "/api/auth/google";
  };
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [isMuted, setIsMuted] = useState(() => soundService.getMuteState());
  const [theme, setTheme] = useState<"emerald" | "violet" | "cobalt">(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("kram_theme") as "emerald" | "violet" | "cobalt" | null;
      if (savedTheme) return savedTheme;
    }
    return "emerald";
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Применение темы к корневому элементу
    const root = document.documentElement;
    root.classList.remove("theme-violet", "theme-cobalt");
    if (theme === "violet") {
      root.classList.add("theme-violet");
    } else if (theme === "cobalt") {
      root.classList.add("theme-cobalt");
    }
  }, [theme]);

  // Блокування прокрутки при відкритому drawer
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleToggleMute = () => {
    const nextMute = soundService.toggleMute();
    setIsMuted(nextMute);
    if (!nextMute) {
      soundService.playClick();
    }
  };

  const handleToggleTheme = () => {
    soundService.playThemeChange();
    let nextTheme: "emerald" | "violet" | "cobalt" = "emerald";
    if (theme === "emerald") nextTheme = "violet";
    else if (theme === "violet") nextTheme = "cobalt";
    else nextTheme = "emerald";

    setTheme(nextTheme);
    localStorage.setItem("kram_theme", nextTheme);
  };

  useEffect(() => {
    if (user) {
      const load = async () => {
        const nots = await apiService.getNotifications(user.id);
        setNotifications(nots);
      };
      
      load();
      
      const timer = setInterval(load, 5000);
      return () => clearInterval(timer);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async () => {
    if (user) {
      await apiService.markNotificationsAsRead(user.id);
      const nots = await apiService.getNotifications(user.id);
      setNotifications(nots);
    }
  };

  const navLinks = [
    { href: "/", label: "Головна", icon: Home },
    { href: "/catalog", label: "Каталог", icon: BookOpen },
    { href: "/leaderboard", label: "Лідерборд", icon: Trophy },
    { href: "/messages", label: "Чат", icon: MessageSquare },
  ];

  if (user) {
    navLinks.push({ href: "/dashboard", label: "Аналітика", icon: LayoutDashboard });
  }
  if (user && user.role === "ADMIN") {
    navLinks.push({ href: "/admin", label: "Адмін-Консоль", icon: ShieldCheck });
  }

  const themeLabel = theme === "emerald" ? "🟢 Смарагд" : theme === "violet" ? "🟣 Фіолет" : "🔵 Кобальт";

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        {/* Live top banner */}
        <div className="bg-gradient-to-r from-brand-primary/10 via-violet-500/10 to-brand-primary/10 border-b border-white/5 py-1 text-center text-[9px] uppercase tracking-widest text-slate-400 font-semibold flex items-center justify-center gap-4">
          <span>🔒 Secure KRAM Protocol v1.4</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">⚡ Live WebSockets: Connected</span>
          <span className="hidden sm:inline">•</span>
          <span className="text-brand-primary text-glow-emerald">🛡️ Anti-Fraud Active</span>
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-slate-900 border border-brand-primary/20 shadow-[0_0_15px_var(--primary-glow)] transition-transform group-hover:scale-105">
                <Gem className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white font-display">
                  KRAM<span className="text-brand-primary text-glow-emerald">.UA</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">Online Auctions</span>
              </div>
            </Link>

            {/* Десктопна навігація */}
            <nav className="hidden md:flex gap-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-xs font-semibold uppercase tracking-wider transition-colors hover:text-brand-primary-hover ${
                      isActive ? "text-brand-primary text-glow-emerald" : "text-slate-400"
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

          {/* Права частина */}
          <div className="flex items-center gap-3">
            
            {/* Перемикач тем — тільки десктоп */}
            <button
              onClick={handleToggleTheme}
              onMouseEnter={() => soundService.playHover()}
              className="hidden sm:flex rounded-xl border border-brand-primary/25 bg-brand-primary/5 p-2 text-brand-primary shadow-[0_0_10px_var(--primary-glow-alpha)] hover:text-white hover:border-brand-primary/50 transition-all"
              title="Змінити тему оформлення"
            >
              <Palette className="h-4 w-4" />
            </button>

            {/* Звуковий тумблер — тільки десктоп */}
            <button
              onClick={handleToggleMute}
              onMouseEnter={() => soundService.playHover()}
              className={`hidden sm:flex rounded-xl border p-2 text-slate-400 hover:text-white transition-all ${
                isMuted ? "border-white/5 hover:bg-white/5" : "border-brand-primary/25 bg-brand-primary/5 text-brand-primary shadow-[0_0_10px_var(--primary-glow-alpha)]"
              }`}
              title={isMuted ? "Увімкнути звук" : "Вимкнути звук"}
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-slate-500" /> : <Volume2 className="h-4 w-4 text-brand-primary animate-pulse" />}
            </button>

            {/* KRAM is free: no internal balances or payments. */}
            {/* Сповіщення */}
            {user && (
              <div className="relative hidden sm:block">
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
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-white shadow-[0_0_8px_var(--primary-glow)] animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                      <h3 className="font-semibold text-xs text-white uppercase tracking-wider">Сповіщення</h3>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold text-brand-primary">{unreadCount} нових</span>
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
                              not.isRead ? "bg-white/[0.01] text-slate-400" : "bg-brand-primary/[0.04] text-slate-200 border-l-2 border-brand-primary"
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

            {/* Профіль */}
            {user ? (
              <div className="relative hidden sm:block">
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
                    className="h-7 w-7 rounded-lg object-cover ring-1 ring-brand-primary/30"
                  />
                  <div className="hidden lg:block text-xs pr-1">
                    <p className="font-semibold text-white max-w-[120px] truncate">{user.name}</p>
                    <p className="text-[9px] text-brand-primary flex items-center gap-1">
                      {user.verified && <CheckCircle className="h-2.5 w-2.5 text-brand-primary fill-brand-primary/20" />}
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
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-brand-primary/10 text-brand-primary border border-brand-primary/25">
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
                                ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
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
                        <Plus className="h-3.5 w-3.5 text-brand-primary" />
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
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={handleGoogleLogin}
                  onMouseEnter={() => soundService.playHover()}
                  className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-950 shadow-[0_0_15px_rgba(255,255,255,0.12)] hover:brightness-110 active:scale-95 transition-all"
                >
                  <span className="text-sm font-black">G</span>
                  Google
                </button>
              </div>
            )}

            {/* Кнопка "Додати лот" */}
            {user && (user.role === "SELLER" || user.role === "ADMIN") && (
              <Link
                href="/sell"
                onMouseEnter={() => soundService.playHover()}
                onClick={() => soundService.playClick()}
                className="hidden sm:flex items-center gap-1.5 rounded-xl bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/25 px-3.5 py-2 text-xs font-extrabold text-brand-primary transition-all shadow-[0_0_15px_var(--primary-glow-alpha)] hover:shadow-[0_0_15px_var(--primary-glow)]"
              >
                <Plus className="h-4 w-4" />
                <span>Додати лот</span>
              </Link>
            )}

            {/* Гамбургер кнопка для мобільних */}
            <button
              className="md:hidden flex items-center justify-center rounded-xl border border-white/10 p-2 text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              onClick={() => {
                soundService.playClick();
                setMobileOpen(true);
              }}
              aria-label="Відкрити меню"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ============= MOBILE DRAWER ============= */}

      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => {
          soundService.playClick();
          setMobileOpen(false);
        }}
        aria-hidden="true"
      />

      {/* Slide-in Drawer */}
      <aside
        className={`fixed top-0 left-0 z-[70] h-full w-[300px] max-w-[85vw] flex flex-col bg-slate-950/98 border-r border-white/10 backdrop-blur-2xl shadow-[10px_0_60px_rgba(0,0,0,0.8)] transition-transform duration-300 ease-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => { soundService.playClick(); setMobileOpen(false); }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-slate-900 border border-brand-primary/20 shadow-[0_0_12px_var(--primary-glow)]">
              <Gem className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white font-display">
                KRAM<span className="text-brand-primary text-glow-emerald">.UA</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-500">Online Auctions</span>
            </div>
          </Link>
          <button
            className="rounded-xl border border-white/10 p-1.5 text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            onClick={() => { soundService.playClick(); setMobileOpen(false); }}
            aria-label="Закрити меню"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User info block */}
        {user ? (
          <div className="mx-4 mt-4 mb-2 rounded-2xl bg-white/[0.03] border border-white/5 p-4">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="h-10 w-10 rounded-xl object-cover ring-2 ring-brand-primary/30"
              />
              <div>
                <p className="text-sm font-bold text-white">{user.name}</p>
                <p className="text-[10px] text-slate-500">{user.email}</p>
                <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-brand-primary/10 text-brand-primary border border-brand-primary/25">
                  {user.role === "ADMIN" ? "Адміністратор" : user.role === "SELLER" ? "Продавець" : "Покупець"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-4 mt-4 mb-2">
            <div className="space-y-2">
              <button
                onClick={() => { handleGoogleLogin(); setMobileOpen(false); }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.12)] hover:brightness-110 active:scale-95 transition-all"
              >
                <span className="text-sm font-black">G</span>
                Увійти через Google
              </button>
            </div>
          </div>
        )}

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          <p className="text-[9px] uppercase tracking-widest text-slate-600 font-bold px-3 py-2">Навігація</p>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-[0_0_10px_var(--primary-glow-alpha)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
                onMouseEnter={() => soundService.playHover()}
                onClick={() => { soundService.playClick(); setMobileOpen(false); }}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? "text-brand-primary" : "text-slate-500"}`} />
                {link.label}
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />}
              </Link>
            );
          })}

          {/* Quick actions */}
          {user && (user.role === "SELLER" || user.role === "ADMIN") && (
            <>
              <div className="h-[1px] bg-white/5 my-3" />
              <p className="text-[9px] uppercase tracking-widest text-slate-600 font-bold px-3 py-2">Швидкі дії</p>
              <Link
                href="/sell"
                onClick={() => { soundService.playClick(); setMobileOpen(false); }}
                onMouseEnter={() => soundService.playHover()}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Plus className="h-4.5 w-4.5 text-brand-primary" />
                Додати лот
              </Link>
            </>
          )}

          {/* Notifications summary */}
          {user && unreadCount > 0 && (
            <div className="mt-3 rounded-xl bg-brand-primary/5 border border-brand-primary/20 px-3 py-3 flex items-center gap-3">
              <Bell className="h-4 w-4 text-brand-primary shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">{unreadCount} нових сповіщень</p>
                <p className="text-[10px] text-slate-500">Перевірте оновлення ставок</p>
              </div>
            </div>
          )}
        </nav>

        {/* Bottom controls */}
        <div className="px-4 py-4 border-t border-white/5 space-y-2">
          {/* Theme & Sound toggles */}
          <div className="flex gap-2">
            <button
              onClick={handleToggleTheme}
              onMouseEnter={() => soundService.playHover()}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-brand-primary/25 bg-brand-primary/5 py-2.5 text-xs font-semibold text-brand-primary hover:border-brand-primary/50 transition-all"
            >
              <Palette className="h-3.5 w-3.5" />
              {themeLabel}
            </button>
            <button
              onClick={handleToggleMute}
              onMouseEnter={() => soundService.playHover()}
              className={`rounded-xl border px-3 py-2.5 transition-all ${
                isMuted ? "border-white/10 text-slate-500" : "border-brand-primary/25 bg-brand-primary/5 text-brand-primary"
              }`}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 animate-pulse" />}
            </button>
          </div>

          {/* Logout */}
          {user && (
            <button
              onClick={() => { soundService.playClick(); logout(); setMobileOpen(false); }}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors border border-white/5"
            >
              <LogOut className="h-3.5 w-3.5" />
              Вийти
            </button>
          )}

          <p className="text-center text-[9px] text-slate-700 uppercase tracking-widest">
            KRAM Protocol v1.4 • Захищено
          </p>
        </div>
      </aside>
    </>
  );
}
