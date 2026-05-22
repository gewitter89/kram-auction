import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seeding...");

  // Clean old data
  await prisma.notification.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.bid.deleteMany({});
  await prisma.listing.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Cleaned existing database.");

  // 1. Create Users
  const userSeller = await prisma.user.create({
    data: {
      id: "user-seller",
      email: "demo-seller@kram.ua",
      password: "seller", // Plain text for simplicity of testing
      name: "Олександр (KRAM Seller)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      role: "SELLER",
      rating: 4.9,
      verified: true,
      balance: 250000.0,
    },
  });

  const userBuyer = await prisma.user.create({
    data: {
      id: "user-buyer",
      email: "demo-buyer@kram.ua",
      password: "buyer",
      name: "Володимир (KRAM Buyer)",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      role: "BUYER",
      rating: 5.0,
      verified: true,
      balance: 150000.0,
    },
  });

  const userAdmin = await prisma.user.create({
    data: {
      id: "user-admin",
      email: "admin@kram.ua",
      password: "admin",
      name: "Головний Адміністратор",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      role: "ADMIN",
      rating: 5.0,
      verified: true,
      balance: 1000000.0,
    },
  });

  console.log("Created users:", [userSeller.email, userBuyer.email, userAdmin.email]);

  // 2. Create Categories
  const cat1 = await prisma.category.create({ data: { id: "cat-1", name: "Електроніка та Гаджети", slug: "electronics", icon: "Laptop" } });
  const cat2 = await prisma.category.create({ data: { id: "cat-2", name: "Антикваріат та Колекції", slug: "antiques", icon: "Gem" } });
  const cat3 = await prisma.category.create({ data: { id: "cat-3", name: "Годинники та Аксесуари", slug: "watches", icon: "Watch" } });
  await prisma.category.create({ data: { id: "cat-4", name: "Авто та Запчастини", slug: "auto", icon: "Car" } });
  await prisma.category.create({ data: { id: "cat-5", name: "Мистецтво та Живопис", slug: "art", icon: "Palette" } });
  await prisma.category.create({ data: { id: "cat-6", name: "Нерухомість", slug: "realty", icon: "Building" } });

  console.log("Created categories.");

  // 3. Create Listings
  const list1 = await prisma.listing.create({
    data: {
      id: "list-1",
      title: "Rolex Submariner Date Black Dial (2023)",
      description: "Ексклюзивний швейцарський годинник в ідеальному стані. Повний комплект: оригінальна коробка, гарантійна карта, чек покупки. Корпус із нержавіючої сталі Oystersteel, керамічний безель Cerachrom. Запас ходу 70 годин. Будь-які перевірки в авторизованому сервісі вітаються.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800",
        "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800"
      ]),
      categoryId: cat3.id,
      sellerId: userSeller.id,
      type: "HYBRID",
      startPrice: 420000.0,
      currentPrice: 460000.0,
      buyNowPrice: 580000.0,
      bidStep: 5000.0,
      status: "ACTIVE",
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 8), // 8 hours left
      deliveryOptions: JSON.stringify(["NOVA_POSHTA", "MEEST"]),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    },
  });

  await prisma.listing.create({
    data: {
      id: "list-2",
      title: "Apple iPhone 15 Pro Max 512GB Natural Titanium",
      description: "Офіційний телефон, куплений в Україні. Стан нового, без жодної мікроподряпини. Ємність акумулятора 98%. Наклеєне дороге захисне скло Spigen, в подарунок два оригінальних чохла FineWoven. Гарантія діє ще 5 місяців.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
        "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800"
      ]),
      categoryId: cat1.id,
      sellerId: userSeller.id,
      type: "BUY_NOW",
      startPrice: 42000.0,
      currentPrice: 42000.0,
      buyNowPrice: 42000.0,
      bidStep: 500.0,
      status: "ACTIVE",
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 48),
      deliveryOptions: JSON.stringify(["NOVA_POSHTA", "UKR_POSHTA", "COURIER"]),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    },
  });

  const list3 = await prisma.listing.create({
    data: {
      id: "list-3",
      title: "Золота монета Микола II 10 рублів (1899 р.)",
      description: "Рідкісна золота монета часів царської Росії. Вага: 8.6 грам. Проба золота: 900. Стан Excellent/UNC, відмінний штемпельний блиск, мінімальний знос. Ідеальний предмет в колекцію або для інвестицій. Оригінальність гарантована.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800",
        "https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=800"
      ]),
      categoryId: cat2.id,
      sellerId: userSeller.id,
      type: "AUCTION",
      startPrice: 18000.0,
      currentPrice: 22600.0,
      bidStep: 200.0,
      status: "ACTIVE",
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 3), // 3 hours left
      deliveryOptions: JSON.stringify(["NOVA_POSHTA", "UKR_POSHTA"]),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
    },
  });

  await prisma.listing.create({
    data: {
      id: "list-4",
      title: "Портативна приставка Steam Deck OLED 1TB",
      description: "Нова версія консолі з яскравим OLED екраном 90 Гц. Батарея тримає довше оригінальної версії. Використовувалася вкрай рідко. Встановлено захисне скло з матовим антивідблисковим покриттям. У комплекті йде преміум кейс, зарядний пристрій та оригінальна коробка.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=800"
      ]),
      categoryId: cat1.id,
      sellerId: userBuyer.id,
      type: "HYBRID",
      startPrice: 26000.0,
      currentPrice: 28000.0,
      buyNowPrice: 31500.0,
      bidStep: 500.0,
      status: "ACTIVE",
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 18),
      deliveryOptions: JSON.stringify(["NOVA_POSHTA", "UKR_POSHTA"]),
      createdAt: new Date(),
    },
  });

  console.log("Created listings.");

  // 4. Create Bids
  await prisma.bid.create({ data: { id: "bid-1", amount: 430000.0, bidderId: userBuyer.id, listingId: list1.id, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4) } });
  await prisma.bid.create({ data: { id: "bid-2", amount: 440000.0, bidderId: userAdmin.id, listingId: list1.id, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3) } });
  await prisma.bid.create({ data: { id: "bid-3", amount: 460000.0, bidderId: userBuyer.id, listingId: list1.id, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1) } });
  await prisma.bid.create({ data: { id: "bid-4", amount: 21000.0, bidderId: userBuyer.id, listingId: list3.id, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10) } });
  await prisma.bid.create({ data: { id: "bid-5", amount: 22600.0, bidderId: userAdmin.id, listingId: list3.id, createdAt: new Date(Date.now() - 1000 * 60 * 30) } });

  console.log("Created bids.");

  // 5. Create Messages
  await prisma.message.create({ data: { id: "msg-1", text: "Доброго дня! Хочу уточнити, чи годинник на офіційній гарантії в Україні?", senderId: userBuyer.id, receiverId: userSeller.id, listingId: list1.id, isRead: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5) } });
  await prisma.message.create({ data: { id: "msg-2", text: "Вітаю! Так, офіційна міжнародна гарантія Rolex, годинник куплений в Женеві в жовтні 2023.", senderId: userSeller.id, receiverId: userBuyer.id, listingId: list1.id, isRead: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4) } });
  await prisma.message.create({ data: { id: "msg-3", text: "Супер. Я зробив ставку на аукціоні, якщо що — готовий забрати по бліц-ціні, але спробую поборотися.", senderId: userBuyer.id, receiverId: userSeller.id, listingId: list1.id, isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3) } });

  console.log("Created messages.");

  // 6. Create Notifications
  await prisma.notification.create({ data: { id: "not-1", userId: userBuyer.id, text: "Ваша ставка на лот Rolex Submariner була прийнята!", type: "BID", isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4) } });
  await prisma.notification.create({ data: { id: "not-2", userId: userSeller.id, text: "Нове повідомлення по вашому лоту Rolex Submariner від користувача Володимир.", type: "INFO", isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5) } });

  console.log("Created notifications.");
  console.log("Seeding completed successfully! 🎉");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
