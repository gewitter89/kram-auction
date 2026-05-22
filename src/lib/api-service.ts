"use client";

// Сервіс API, що працює поверх серверних Next.js Route Handlers з повною реактивністю.
// Дозволяє робити ставки, купувати лоти, переписуватись та отримувати
// ТТН Нової Пошти в реальному часі через SQLite БД.

import { } from "./db";
import { Category, Listing, Bid, Message, Transaction, Notification } from "@prisma/client";


export const apiService = {
  initialize() {
    // Більше не потрібно ініціалізувати localStorage,
    // база даних SQLite ініціалізується на сервері за допомогою Prisma
  },

  async getCategories(): Promise<any[]> {
    try {
      const res = await fetch("/api/listings");
      if (!res.ok) throw new Error("Помилка завантаження категорій");
      const data = await res.json();
      return data.categories || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async getListings(): Promise<any[]> {
    try {
      const res = await fetch("/api/listings");
      if (!res.ok) throw new Error("Помилка завантаження лотів");
      const data = await res.json();
      return data.listings || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async getListingById(id: string): Promise<| null> {
    try {
      const res = await fetch(`/api/listings/${id}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.listing || null;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  async createListing(listingData: Omit<"id" | "currentPrice" | "status" | "createdAt" | "bidsCount">): Promise<any> {
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(listingData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Помилка створення лоту");
    }
    const data = await res.json();
    return data.listing;
  },

  async getBids(listingId: string): Promise<any[]> {
    try {
      const res = await fetch(`/api/bids?listingId=${listingId}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.bids || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async placeBid(listingId: string, bidderId: string, bidderName: string, amount: number): Promise<{ success: boolean; error?: string; bid?: Bid }> {
    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, bidderId, amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Помилка здійснення ставки" };
      }
      return { success: true, bid: data.bid };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  },

  async buyNow(listingId: string, buyerId: string, deliveryProvider: string): Promise<{ success: boolean; error?: string; transaction?: Transaction }> {
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, buyerId, deliveryProvider }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Помилка викупу лоту" };
      }
      return { success: true, transaction: data.transaction };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  },

  async createCheckoutSession(listingId: string, buyerId: string, deliveryProvider: string, amount: number): Promise<{ url?: string; error?: string }> {
    try {
      const res = await fetch("/api/checkout_session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, buyerId, deliveryProvider, amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || "Помилка створення сесії" };
      }
      return { url: data.url };
    } catch (e) {
      return { error: String(e) };
    }
  },

  async getMessages(listingId: string, user1: string, user2: string): Promise<any[]> {
    try {
      const res = await fetch(`/api/messages?listingId=${listingId}&user1=${user1}&user2=${user2}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.messages || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async sendMessage(listingId: string, senderId: string, receiverId: string, text: string): Promise<{ message: Message; warning?: string }> {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, senderId, receiverId, text }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Помилка надсилання повідомлення");
    }
    return { message: data.message, warning: data.warning };
  },

  async getNotifications(userId: string): Promise<any[]> {
    try {
      const res = await fetch(`/api/notifications?userId=${userId}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.notifications || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async addNotification(userId: string, text: string, type: ["type"] = "INFO"): Promise<any> {
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, text, type }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Помилка додавання сповіщення");
    }
    return data.notification;
  },

  async markNotificationsAsRead(userId: string): Promise<void> {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
    } catch (e) {
      console.error(e);
    }
  },

  async getTransactions(userId: string): Promise<any[]> {
    try {
      const res = await fetch(`/api/transactions?userId=${userId}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.transactions || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async getLeaderboard(): Promise<any[]> {
    try {
      const res = await fetch("/api/leaderboard");
      if (!res.ok) return [];
      const data = await res.json();
      return data.leaderboard || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async updateVerificationStep(userId: string, step: number): Promise<boolean> {
    try {
      const res = await fetch("/api/users/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, step }),
      });
      return res.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
};
