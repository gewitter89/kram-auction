import { PrismaClient } from "@prisma/client";

// Global cache for PrismaClient to prevent hot-reloading connections
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ==========================================
// МАКЕТНАЯ ИН-МЕМОРИ БАЗА ДАННЫХ ДЛЯ ОТКАТА
// ==========================================
// Если реальная база данных не настроена или выдает ошибку,
// приложение прозрачно переключится на этот реактивный in-memory слой,
// гарантируя 100% работоспособность демо-версии.

export interface MockUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: "BUYER" | "SELLER" | "ADMIN";
  rating: number;
  verified: boolean;
  balance: number;
}

export interface MockCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface MockListing {
  id: string;
  title: string;
  description: string;
  images: string[];
  categoryId: string;
  sellerId: string;
  type: "AUCTION" | "BUY_NOW" | "HYBRID";
  startPrice: number;
  currentPrice: number;
  buyNowPrice?: number;
  bidStep: number;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  endDate: string;
  deliveryOptions: string[];
  createdAt: string;
  bidsCount: number;
}

export interface MockBid {
  id: string;
  amount: number;
  bidderId: string;
  listingId: string;
  createdAt: string;
  bidderName: string;
}

export interface MockMessage {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  listingId: string;
  isRead: boolean;
  createdAt: string;
}

export interface MockTransaction {
  id: string;
  amount: number;
  listingId: string;
  buyerId: string;
  sellerId: string;
  deliveryProvider: string;
  deliveryStatus: "PENDING" | "SENT" | "DELIVERED" | "RECEIVED";
  ttn?: string;
  paymentStatus: "PENDING" | "PAID" | "REFUNDED";
  createdAt: string;
}

export interface MockNotification {
  id: string;
  userId: string;
  text: string;
  type: "INFO" | "BID" | "OUTBID" | "WON" | "SOLD" | "SHIPMENT";
  isRead: boolean;
  createdAt: string;
}

// Загрузка начальных данных
const initialCategories: MockCategory[] = [
  { id: "cat-1", name: "Электроника и Гаджеты", slug: "electronics", icon: "Laptop" },
  { id: "cat-2", name: "Антиквариат и Коллекции", slug: "antiques", icon: "Gem" },
  { id: "cat-3", name: "Часы и Аксессуары", slug: "watches", icon: "Watch" },
  { id: "cat-4", name: "Авто и Запчасти", slug: "auto", icon: "Car" },
  { id: "cat-5", name: "Искусство и Живопись", slug: "art", icon: "Palette" },
  { id: "cat-6", name: "Недвижимость", slug: "realty", icon: "Building" }
];

const initialUsers: MockUser[] = [
  {
    id: "user-seller",
    email: "demo-seller@kram.ua",
    name: "Александр (KRAM Seller)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    role: "SELLER",
    rating: 4.9,
    verified: true,
    balance: 250000
  },
  {
    id: "user-buyer",
    email: "demo-buyer@kram.ua",
    name: "Владимир (KRAM Buyer)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    role: "BUYER",
    rating: 5.0,
    verified: true,
    balance: 150000
  },
  {
    id: "user-admin",
    email: "admin@kram.ua",
    name: "Главный Администратор",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    role: "ADMIN",
    rating: 5.0,
    verified: true,
    balance: 1000000
  }
];

const initialListings: MockListing[] = [
  {
    id: "list-1",
    title: "Rolex Submariner Date Black Dial (2023)",
    description: "Эксклюзивные швейцарские часы в идеальном состоянии. Полный комплект: оригинальная коробка, гарантийная карта, чек покупки. Корпус из нержавеющей стали Oystersteel, керамический безель Cerachrom. Запас хода 70 часов. Любые проверки в авторизованном сервисе приветствуются.",
    images: [
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800",
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800"
    ],
    categoryId: "cat-3",
    sellerId: "user-seller",
    type: "HYBRID",
    startPrice: 420000,
    currentPrice: 460000,
    buyNowPrice: 580000,
    bidStep: 5000,
    status: "ACTIVE",
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(), // 8 часов осталось
    deliveryOptions: ["NOVA_POSHTA", "MEEST"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    bidsCount: 8
  },
  {
    id: "list-2",
    title: "Apple iPhone 15 Pro Max 512GB Natural Titanium",
    description: "Официальный телефон, купленный в Украине. Состояние нового, без единой микроцарапины. Емкость аккумулятора 98%. Наклеено дорогое защитное стекло Spigen, в подарок два оригинальных чехла FineWoven. Гарантия действует еще 5 месяцев.",
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800"
    ],
    categoryId: "cat-1",
    sellerId: "user-seller",
    type: "BUY_NOW",
    startPrice: 42000,
    currentPrice: 42000,
    buyNowPrice: 42000,
    bidStep: 500,
    status: "ACTIVE",
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    deliveryOptions: ["NOVA_POSHTA", "UKR_POSHTA", "COURIER"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    bidsCount: 0
  },
  {
    id: "list-3",
    title: "Золотая монета Николай II 10 рублей (1899 г.)",
    description: "Редкая золотая монета времен царской России. Вес: 8.6 грамм. Проба золота: 900. Состояние Excellent/UNC, отличный штемпельный блеск, минимальный износ. Идеальный предмет в коллекцию или для инвестиций. Оригинальность гарантирована.",
    images: [
      "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800",
      "https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=800"
    ],
    categoryId: "cat-2",
    sellerId: "user-seller",
    type: "AUCTION",
    startPrice: 18000,
    currentPrice: 22600,
    bidStep: 200,
    status: "ACTIVE",
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(), // 3 часа осталось
    deliveryOptions: ["NOVA_POSHTA", "UKR_POSHTA"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    bidsCount: 23
  },
  {
    id: "list-4",
    title: "Портативная приставка Steam Deck OLED 1TB",
    description: "Новейшая версия консоли с ярким OLED экраном 90 Гц. Батарея держит дольше оригинальной версии. Использовалась крайне редко. Установлено защитное стекло с матовым антибликовым покрытием. В комплекте идет премиум кейс, зарядное устройство и оригинальная коробка.",
    images: [
      "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=800"
    ],
    categoryId: "cat-1",
    sellerId: "user-buyer", // другой продавец
    type: "HYBRID",
    startPrice: 26000,
    currentPrice: 28000,
    buyNowPrice: 31500,
    bidStep: 500,
    status: "ACTIVE",
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    deliveryOptions: ["NOVA_POSHTA", "UKR_POSHTA"],
    createdAt: new Date().toISOString(),
    bidsCount: 4
  },
  {
    id: "list-5",
    title: "Картина маслом «Утренний туман на Днепре»",
    description: "Холст, масло, оформлена в дорогой деревянный багет. Размер холста 60х80 см. Работа известного украинского художника-пейзажиста. Написана в 2018 году. Прекрасный глубокий колорит, успокаивающая атмосфера. Живописный мазок.",
    images: [
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800",
      "https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?w=800"
    ],
    categoryId: "cat-5",
    sellerId: "user-seller",
    type: "AUCTION",
    startPrice: 9000,
    currentPrice: 9500,
    bidStep: 250,
    status: "ACTIVE",
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    deliveryOptions: ["NOVA_POSHTA", "COURIER"],
    createdAt: new Date().toISOString(),
    bidsCount: 2
  }
];

const initialBids: MockBid[] = [
  { id: "bid-1", amount: 430000, bidderId: "user-buyer", listingId: "list-1", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), bidderName: "Владимир (KRAM Buyer)" },
  { id: "bid-2", amount: 440000, bidderId: "user-admin", listingId: "list-1", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), bidderName: "Главный Администратор" },
  { id: "bid-3", amount: 460000, bidderId: "user-buyer", listingId: "list-1", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), bidderName: "Владимир (KRAM Buyer)" },
  { id: "bid-4", amount: 21000, bidderId: "user-buyer", listingId: "list-3", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(), bidderName: "Владимир (KRAM Buyer)" },
  { id: "bid-5", amount: 22600, bidderId: "user-admin", listingId: "list-3", createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), bidderName: "Главный Администратор" }
];

const initialMessages: MockMessage[] = [
  { id: "msg-1", text: "Здравствуйте! Хочу уточнить, часы на официальной гарантии в Украине?", senderId: "user-buyer", receiverId: "user-seller", listingId: "list-1", isRead: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: "msg-2", text: "Приветствую! Да, официальная международная гарантия Rolex, часы куплены в Женеве в октябре 2023.", senderId: "user-seller", receiverId: "user-buyer", listingId: "list-1", isRead: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
  { id: "msg-3", text: "Супер. Я сделал ставку на аукционе, если что — готов забрать по блиц-цене, но попробую побороться.", senderId: "user-buyer", receiverId: "user-seller", listingId: "list-1", isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() }
];

const initialNotifications: MockNotification[] = [
  { id: "not-1", userId: "user-buyer", text: "Ваша ставка на лот Rolex Submariner была принята!", type: "BID", isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
  { id: "not-2", userId: "user-seller", text: "Новое сообщение по вашему лоту Rolex Submariner от пользователя Владимир.", type: "INFO", isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() }
];

// Локальное реактивное хранилище (в памяти сервера)
class MemoryDatabase {
  users: MockUser[] = [...initialUsers];
  categories: MockCategory[] = [...initialCategories];
  listings: MockListing[] = [...initialListings];
  bids: MockBid[] = [...initialBids];
  messages: MockMessage[] = [...initialMessages];
  transactions: MockTransaction[] = [];
  notifications: MockNotification[] = [...initialNotifications];

  // Методы доступа
  getUsers() { return this.users; }
  getUserById(id: string) { return this.users.find(u => u.id === id); }
  getUserByEmail(email: string) { return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
  
  getCategories() { return this.categories; }
  
  getListings() { return this.listings; }
  getListingById(id: string) { return this.listings.find(l => l.id === id); }
  
  getBids(listingId?: string) {
    if (listingId) return this.bids.filter(b => b.listingId === listingId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return this.bids;
  }
  
  addBid(listingId: string, bidderId: string, amount: number) {
    const listing = this.getListingById(listingId);
    const bidder = this.getUserById(bidderId);
    if (!listing || !bidder) return null;
    
    // Проверка лимитов баланса
    if (bidder.balance < amount) {
      throw new Error("Недостаточно средств на балансе!");
    }

    const newBid: MockBid = {
      id: `bid-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      amount,
      bidderId,
      listingId,
      createdAt: new Date().toISOString(),
      bidderName: bidder.name
    };
    
    this.bids.push(newBid);
    
    // Обновляем текущую цену лота
    listing.currentPrice = amount;
    listing.bidsCount += 1;
    
    // Оповещаем продавца
    this.addNotification(
      listing.sellerId,
      `Новая ставка на ваш лот "${listing.title}": ${amount.toLocaleString()} UAH`,
      "BID"
    );

    return newBid;
  }

  addListing(data: Omit<MockListing, "id" | "currentPrice" | "status" | "createdAt" | "bidsCount">) {
    const newListing: MockListing = {
      ...data,
      id: `list-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      currentPrice: data.startPrice,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      bidsCount: 0
    };
    this.listings.push(newListing);
    return newListing;
  }

  buyListingNow(listingId: string, buyerId: string, deliveryProvider: string) {
    const listing = this.getListingById(listingId);
    const buyer = this.getUserById(buyerId);
    if (!listing || !buyer) throw new Error("Товар или покупатель не найден");
    if (!listing.buyNowPrice) throw new Error("У этого товара нет фиксированной цены Блиц");
    if (buyer.balance < listing.buyNowPrice) throw new Error("Недостаточно средств на балансе");

    // Вычитаем баланс покупателя и зачисляем продавцу
    buyer.balance -= listing.buyNowPrice;
    const seller = this.getUserById(listing.sellerId);
    if (seller) seller.balance += listing.buyNowPrice;

    // Закрываем лот
    listing.status = "COMPLETED";

    // Создаем транзакцию с Новой Почтой / Доставкой
    const newTx: MockTransaction = {
      id: `tx-${Date.now()}`,
      amount: listing.buyNowPrice,
      listingId,
      buyerId,
      sellerId: listing.sellerId,
      deliveryProvider,
      deliveryStatus: "PENDING",
      paymentStatus: "PAID",
      ttn: deliveryProvider === "NOVA_POSHTA" ? `204500${Math.floor(100000 + Math.random() * 900000)}` : `UA${Math.floor(100000000 + Math.random() * 900000000)}`,
      createdAt: new Date().toISOString()
    };
    this.transactions.push(newTx);

    // Уведомления
    this.addNotification(
      buyerId,
      `Вы успешно купили лот "${listing.title}" за ${listing.buyNowPrice.toLocaleString()} UAH! Оформлена доставка через ${deliveryProvider}. ТТН: ${newTx.ttn}`,
      "WON"
    );
    this.addNotification(
      listing.sellerId,
      `Ваш лот "${listing.title}" выкуплен по блиц-цене за ${listing.buyNowPrice.toLocaleString()} UAH! Отправьте посылку. ТТН: ${newTx.ttn}`,
      "SOLD"
    );

    return newTx;
  }

  getMessages(listingId: string, user1: string, user2: string) {
    return this.messages.filter(
      m => m.listingId === listingId && 
      ((m.senderId === user1 && m.receiverId === user2) || 
       (m.senderId === user2 && m.receiverId === user1))
    ).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  addMessage(listingId: string, senderId: string, receiverId: string, text: string) {
    const newMsg: MockMessage = {
      id: `msg-${Date.now()}`,
      text,
      senderId,
      receiverId,
      listingId,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.messages.push(newMsg);
    return newMsg;
  }

  getNotifications(userId: string) {
    return this.notifications.filter(n => n.userId === userId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addNotification(userId: string, text: string, type: MockNotification["type"] = "INFO") {
    const newNot: MockNotification = {
      id: `not-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId,
      text,
      type,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.push(newNot);
    return newNot;
  }

  getTransactions(userId: string) {
    return this.transactions.filter(t => t.buyerId === userId || t.sellerId === userId);
  }
}

// Создаем единственный синглтон-объект в глобальной области видимости для серверов Next.js
const globalForMockDb = globalThis as unknown as {
  mockDb: MemoryDatabase | undefined;
};

if (!globalForMockDb.mockDb) {
  globalForMockDb.mockDb = new MemoryDatabase();
}

export const mockDb = globalForMockDb.mockDb;
export type { MemoryDatabase };
