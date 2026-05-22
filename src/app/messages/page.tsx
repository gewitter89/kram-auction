"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { apiService } from "@/lib/api-service";
import { MockMessage, MockListing } from "@/lib/db";
import { 
  Send, 
  ShieldAlert, 
  MessageSquare,
  Sparkles,
  Info,
  CheckCircle,
  Gem,
  AlertTriangle
} from "lucide-react";

export default function MessagesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<{
    listing: MockListing;
    messages: MockMessage[];
    otherUserId: string;
    otherUserName: string;
  }[]>([]);
  
  const [activeConvIdx, setActiveConvIdx] = useState<number>(-1);
  const [typedMessage, setTypedMessage] = useState("");
  const [localWarning, setLocalWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    apiService.initialize();
    loadConversations();
  }, [user]);

  // Скролл вниз при загрузке или отправке сообщения
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConvIdx, conversations]);

  const loadConversations = () => {
    if (!user) return;
    const listings = apiService.getListings();
    
    // Группируем сообщения по связке (listingId, sellerId/buyerId)
    // В прототипе у нас есть демо-сообщения между user-buyer и user-seller по лоту list-1
    const convs: typeof conversations = [];

    listings.forEach(listing => {
      const msgs = apiService.getMessages(listing.id, "user-buyer", "user-seller");
      if (msgs.length > 0) {
        const isSeller = user.id === listing.sellerId;
        const otherUserId = isSeller ? "user-buyer" : "user-seller";
        const otherUserName = isSeller ? "Владимир (Покупатель)" : "Александр (Продавец)";

        convs.push({
          listing,
          messages: msgs,
          otherUserId,
          otherUserName
        });
      }
    });

    setConversations(convs);
    if (convs.length > 0 && activeConvIdx === -1) {
      setActiveConvIdx(0);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || activeConvIdx === -1 || typedMessage.trim() === "") return;

    const activeConv = conversations[activeConvIdx];
    
    // Отправляем
    const res = apiService.sendMessage(
      activeConv.listing.id,
      user.id,
      activeConv.otherUserId,
      typedMessage
    );

    // Модераторские предупреждения
    if (res.warning) {
      setLocalWarning(res.warning);
    } else {
      setLocalWarning(null);
    }

    setTypedMessage("");
    
    // Перезагружаем сообщения
    loadConversations();
  };

  if (!user) return null;

  const activeConv = activeConvIdx !== -1 ? conversations[activeConvIdx] : null;

  return (
    <div className="flex flex-col min-h-screen bg-[#030712]">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col">
        
        {/* Заголовок */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-white font-display">Сообщения сделок</h1>
          <p className="text-xs text-slate-400 mt-1">Все переписки защищены встроенным фильтром мошенничества</p>
        </div>

        {/* Сетка чатов */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow items-stretch min-h-[500px]">
          
          {/* Левая панель: Списки диалогов */}
          <div className="glass-panel rounded-3xl border border-white/5 p-4 flex flex-col space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2">Ваши диалоги</h3>
            
            <div className="space-y-2 overflow-y-auto flex-grow max-h-[450px] pr-1">
              {conversations.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">Активных чатов нет.</p>
              ) : (
                conversations.map((conv, idx) => {
                  const isActive = idx === activeConvIdx;
                  return (
                    <button
                      key={conv.listing.id}
                      onClick={() => {
                        setActiveConvIdx(idx);
                        setLocalWarning(null);
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                        isActive
                          ? "border-emerald-500 bg-emerald-500/5 text-white"
                          : "border-white/5 bg-white/[0.01] hover:bg-white/5 text-slate-300"
                      }`}
                    >
                      <div className="h-10 w-10 rounded-xl bg-slate-950 overflow-hidden shrink-0 border border-white/10">
                        <img src={conv.listing.images[0]} alt="Lot Preview" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-xs font-bold truncate block">{conv.otherUserName}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate mt-0.5">{conv.listing.title}</span>
                        {conv.messages.length > 0 && (
                          <p className="text-[10px] text-slate-400 truncate mt-1 leading-normal italic">
                            {conv.messages[conv.messages.length - 1].text}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Правая панель: Поток сообщений активного чата */}
          <div className="md:col-span-2 glass-panel rounded-3xl border border-white/5 flex flex-col overflow-hidden">
            {activeConv ? (
              <>
                {/* Шапка чата */}
                <div className="border-b border-white/5 p-4 bg-slate-950/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-950 overflow-hidden border border-white/10">
                      <img src={activeConv.listing.images[0]} alt="Lot Preview" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{activeConv.otherUserName}</h4>
                      <Link href={`/lot/${activeConv.listing.id}`} className="text-[10px] text-emerald-400 hover:underline">
                        По лоту: {activeConv.listing.title}
                      </Link>
                    </div>
                  </div>
                  
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-400 border border-emerald-500/25">
                    Сделка застрахована
                  </span>
                </div>

                {/* Баннер безопасности */}
                <div className="bg-amber-500/5 border-b border-amber-500/10 p-3.5 text-[10px] text-amber-300/90 leading-relaxed flex items-start gap-2.5">
                  <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Внимание:</strong> Никогда не соглашайтесь на проведение расчетов вне площадки. Не отправляйте предоплату на карты напрямую. Всегда используйте безопасную сделку KRAM.UA, чтобы обезопасить свои средства.
                  </span>
                </div>

                {/* Поток сообщений */}
                <div className="flex-grow p-4 overflow-y-auto space-y-4 max-h-[350px] min-h-[300px]">
                  
                  {/* Первое информационное сообщение */}
                  <div className="text-center py-2">
                    <span className="inline-block bg-white/5 rounded-lg px-2.5 py-1 text-[9px] text-slate-500 border border-white/5">
                      Начало безопасного диалога по сделке
                    </span>
                  </div>

                  {activeConv.messages.map((msg) => {
                    const isMe = msg.senderId === user.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`rounded-2xl px-4 py-2.5 max-w-[70%] text-xs leading-relaxed ${
                            isMe
                              ? "bg-emerald-500 text-white rounded-br-none shadow-[0_4px_12px_rgba(16,185,129,0.15)]"
                              : "bg-white/5 text-slate-200 border border-white/10 rounded-bl-none"
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.text}</p>
                          <span className={`text-[8px] block text-right mt-1.5 ${isMe ? "text-emerald-200" : "text-slate-500"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Робот-модератор (предупреждение при попытке мошенничества) */}
                  {localWarning && (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-4 text-xs text-amber-400 leading-normal flex items-start gap-2.5 animate-fadeIn">
                      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                      <span>{localWarning}</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Форма ввода сообщения */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-slate-950/30 flex gap-2">
                  <input
                    type="text"
                    placeholder="Введите ваше сообщение... (номера телефонов скрываются системой)"
                    className="flex-grow glass-input rounded-xl text-xs px-3.5 py-3"
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-500 hover:bg-emerald-400 p-3 text-white transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)] shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center p-12 text-center">
                <MessageSquare className="h-10 w-10 text-slate-600 mb-3" />
                <p className="text-xs text-slate-500">Выберите диалог из списка слева, чтобы начать общение.</p>
              </div>
            )}
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
