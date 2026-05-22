"use client";

// Сервис API, работающий поверх LocalStorage с полной реактивностью.
// Позволяет делать ставки, покупать лоты, переписываться и получать
// ТТН Новой Почты в реальном времени с полной симуляцией бэкенда.

import { mockDb, MockListing, MockBid, MockMessage, MockNotification, MockTransaction, MockCategory } from "./db";

// Инициализация локального хранилища на клиенте
const IS_SERVER = typeof window === "undefined";

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (IS_SERVER) return defaultValue;
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(item);
  } catch {
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T) {
  if (IS_SERVER) return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Загрузка списков с сервера в LocalStorage при первом входе
export const apiService = {
  initialize() {
    if (IS_SERVER) return;
    getStorageItem("kram_categories", mockDb.getCategories());
    getStorageItem("kram_listings", mockDb.getListings());
    getStorageItem("kram_bids", mockDb.getBids());
    getStorageItem("kram_messages", mockDb.getMessages("list-1", "user-buyer", "user-seller"));
    getStorageItem("kram_notifications", mockDb.getNotifications("user-buyer"));
    getStorageItem("kram_transactions", []);
  },

  getCategories(): MockCategory[] {
    return getStorageItem("kram_categories", mockDb.getCategories());
  },

  getListings(): MockListing[] {
    return getStorageItem("kram_listings", mockDb.getListings());
  },

  getListingById(id: string): MockListing | null {
    const listings = this.getListings();
    return listings.find(l => l.id === id) || null;
  },

  createListing(listingData: Omit<MockListing, "id" | "currentPrice" | "status" | "createdAt" | "bidsCount">): MockListing {
    const listings = this.getListings();
    const newListing: MockListing = {
      ...listingData,
      id: `list-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      currentPrice: listingData.startPrice,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      bidsCount: 0
    };
    listings.unshift(newListing);
    setStorageItem("kram_listings", listings);
    return newListing;
  },

  getBids(listingId: string): MockBid[] {
    const bids = getStorageItem<MockBid[]>("kram_bids", mockDb.getBids());
    return bids
      .filter(b => b.listingId === listingId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  placeBid(listingId: string, bidderId: string, bidderName: string, amount: number): { success: boolean; error?: string; bid?: MockBid } {
    const listings = this.getListings();
    const listingIndex = listings.findIndex(l => l.id === listingId);
    if (listingIndex === -1) return { success: false, error: "Лот не найден" };
    
    const listing = listings[listingIndex];
    if (amount <= listing.currentPrice) {
      return { success: false, error: `Ставка должна быть выше текущей цены (${listing.currentPrice} UAH)` };
    }

    // Создаем ставку
    const bids = getStorageItem<MockBid[]>("kram_bids", mockDb.getBids());
    const newBid: MockBid = {
      id: `bid-${Date.now()}`,
      amount,
      bidderId,
      listingId,
      createdAt: new Date().toISOString(),
      bidderName
    };
    bids.push(newBid);
    setStorageItem("kram_bids", bids);

    // Обновляем лот
    listing.currentPrice = amount;
    listing.bidsCount += 1;
    listings[listingIndex] = listing;
    setStorageItem("kram_listings", listings);

    // Добавляем уведомление продавцу
    this.addNotification(
      listing.sellerId,
      `Новая ставка на ваш лот "${listing.title}": ${amount.toLocaleString()} UAH`,
      "BID"
    );

    // Уведомляем предыдущих участников
    const previousBidders = Array.from(new Set(bids.filter(b => b.listingId === listingId && b.bidderId !== bidderId && b.bidderId !== listing.sellerId).map(b => b.bidderId)));
    previousBidders.forEach(pId => {
      this.addNotification(
        pId,
        `Вашу ставку на лот "${listing.title}" перебили! Новая ставка: ${amount.toLocaleString()} UAH`,
        "OUTBID"
      );
    });

    return { success: true, bid: newBid };
  },

  buyNow(listingId: string, buyerId: string, deliveryProvider: string): { success: boolean; error?: string; transaction?: MockTransaction } {
    const listings = this.getListings();
    const listingIndex = listings.findIndex(l => l.id === listingId);
    if (listingIndex === -1) return { success: false, error: "Лот не найден" };
    
    const listing = listings[listingIndex];
    if (!listing.buyNowPrice) return { success: false, error: "У лота нет блиц-цены" };

    // Помечаем лот завершенным
    listing.status = "COMPLETED";
    listings[listingIndex] = listing;
    setStorageItem("kram_listings", listings);

    // Генерируем ТТН Новой Почты / Укрпочты
    const ttn = deliveryProvider === "NOVA_POSHTA" 
      ? `204500${Math.floor(100000 + Math.random() * 900000)}` 
      : `UA${Math.floor(100000000 + Math.random() * 900000000)}`;

    // Создаем транзакцию
    const transactions = getStorageItem<MockTransaction[]>("kram_transactions", []);
    const newTx: MockTransaction = {
      id: `tx-${Date.now()}`,
      amount: listing.buyNowPrice,
      listingId,
      buyerId,
      sellerId: listing.sellerId,
      deliveryProvider,
      deliveryStatus: "PENDING",
      paymentStatus: "PAID",
      ttn,
      createdAt: new Date().toISOString()
    };
    transactions.push(newTx);
    setStorageItem("kram_transactions", transactions);

    // Добавляем уведомления
    this.addNotification(
      buyerId,
      `Поздравляем! Вы выкупили лот "${listing.title}" за ${listing.buyNowPrice.toLocaleString()} UAH. Доставка: ${deliveryProvider}, ТТН: ${ttn}`,
      "WON"
    );
    this.addNotification(
      listing.sellerId,
      `Ваш лот "${listing.title}" выкуплен за ${listing.buyNowPrice.toLocaleString()} UAH. ТТН для отправки: ${ttn}`,
      "SOLD"
    );

    return { success: true, transaction: newTx };
  },

  // Чат и сообщения с проверкой на контактные данные (Anti-Fraud)
  getMessages(listingId: string, user1: string, user2: string): MockMessage[] {
    const allMessages = getStorageItem<MockMessage[]>("kram_messages", mockDb.getMessages(listingId, user1, user2));
    return allMessages.filter(
      m => m.listingId === listingId && 
      ((m.senderId === user1 && m.receiverId === user2) || 
       (m.senderId === user2 && m.receiverId === user1))
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  sendMessage(listingId: string, senderId: string, receiverId: string, text: string): { message: MockMessage; warning?: string } {
    const allMessages = getStorageItem<MockMessage[]>("kram_messages", []);
    const newMsg: MockMessage = {
      id: `msg-${Date.now()}`,
      text,
      senderId,
      receiverId,
      listingId,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    
    allMessages.push(newMsg);
    setStorageItem("kram_messages", allMessages);

    // Проверка на спам/мошенничество (телефоны, телеграм, ссылки)
    // Шаблоны: номера телефонов, ссылки типа t.me, @username, или http
    const phonePattern = /(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{2}[- ]?\d{2}/g;
    const linksPattern = /(?:https?:\/\/)?(?:t\.me|viber|instagram|facebook|olx|vk)\.[a-z]{2,6}\b/i;
    const telegramUsernamePattern = /@[a-zA-Z0-9_]{5,32}/;

    let warning = undefined;
    if (phonePattern.test(text) || linksPattern.test(text) || telegramUsernamePattern.test(text)) {
      warning = "⚠️ Система безопасности KRAM: Обнаружены контактные данные. Настоятельно рекомендуем проводить все сделки исключительно внутри чата платформы через Безопасную Сделку. Обход платформы лишает вас защиты от мошенничества!";
    }

    return { message: newMsg, warning };
  },

  // Уведомления
  getNotifications(userId: string): MockNotification[] {
    const notifications = getStorageItem<MockNotification[]>("kram_notifications", []);
    return notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  addNotification(userId: string, text: string, type: MockNotification["type"] = "INFO"): MockNotification {
    const notifications = getStorageItem<MockNotification[]>("kram_notifications", []);
    const newNot: MockNotification = {
      id: `not-${Date.now()}`,
      userId,
      text,
      type,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    notifications.unshift(newNot);
    setStorageItem("kram_notifications", notifications);
    return newNot;
  },

  markNotificationsAsRead(userId: string) {
    const notifications = getStorageItem<MockNotification[]>("kram_notifications", []);
    const updated = notifications.map(n => n.userId === userId ? { ...n, isRead: true } : n);
    setStorageItem("kram_notifications", updated);
  },

  getTransactions(userId: string): MockTransaction[] {
    const transactions = getStorageItem<MockTransaction[]>("kram_transactions", []);
    return transactions.filter(t => t.buyerId === userId || t.sellerId === userId);
  }
};
