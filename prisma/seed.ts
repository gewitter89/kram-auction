import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Створення користувачів
  const admin = await prisma.user.upsert({
    where: { email: "admin@kram.ua" },
    update: {},
    create: {
      email: "admin@kram.ua",
      password: "hashed_password_placeholder", // В майбутньому замінити на реальний хеш
      name: "Головний Адміністратор",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      role: "ADMIN",
      rating: 5.0,
      verified: true,
      balance: 1000000
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: "demo-seller@kram.ua" },
    update: {},
    create: {
      email: "demo-seller@kram.ua",
      password: "hashed_password_placeholder",
      name: "Олександр (KRAM Seller)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      role: "SELLER",
      rating: 4.9,
      verified: true,
      balance: 250000
    },
  });

  const buyer = await prisma.user.upsert({
    where: { email: "demo-buyer@kram.ua" },
    update: {},
    create: {
      email: "demo-buyer@kram.ua",
      password: "hashed_password_placeholder",
      name: "Володимир (KRAM Buyer)",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      role: "BUYER",
      rating: 5.0,
      verified: true,
      balance: 150000
    },
  });

  console.log("Users created.");

  // 2. Створення категорій
  const categories = [
    { name: "Електроніка та Гаджети", slug: "electronics", icon: "Laptop" },
    { name: "Антикваріат та Колекції", slug: "antiques", icon: "Gem" },
    { name: "Годинники та Аксесуари", slug: "watches", icon: "Watch" },
    { name: "Авто та Запчастини", slug: "auto", icon: "Car" },
    { name: "Мистецтво та Живопис", slug: "art", icon: "Palette" },
    { name: "Нерухомість", slug: "realty", icon: "Building" }
  ];

  const categoryRecords = [];
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c
    });
    categoryRecords.push(cat);
  }

  console.log("Categories created.");

  // 3. Створення лотів
  // Очистимо старі лоти для чистого сідінгу
  await prisma.listing.deleteMany({});

  const listing1 = await prisma.listing.create({
    data: {
      title: "Rolex Submariner Date Black Dial (2023)",
      description: "Ексклюзивний швейцарський годинник в ідеальному стані. Повний комплект: оригінальна коробка, гарантійна карта, чек про купівлю. Корпус із нержавіючої сталі Oystersteel, керамічний безель Cerachrom. Запас ходу 70 годин. Будь-які перевірки в авторизованому сервісі вітаються.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800",
        "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800"
      ]),
      categoryId: categoryRecords.find(c => c.slug === "watches")!.id,
      sellerId: seller.id,
      type: "HYBRID",
      startPrice: 420000,
      currentPrice: 460000,
      buyNowPrice: 580000,
      bidStep: 5000,
      status: "ACTIVE",
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 8), // 8 годин
      deliveryOptions: JSON.stringify(["NOVA_POSHTA", "MEEST"]),
    }
  });

  const listing2 = await prisma.listing.create({
    data: {
      title: "Apple iPhone 15 Pro Max 512GB Natural Titanium",
      description: "Офіційний телефон, куплений в Україні. Стан нового, без жодної мікроподряпини. Ємність акумулятора 98%. Наклеєне дороге захисне скло Spigen, у подарунок два оригінальні чохли FineWoven. Гарантія діє ще 5 місяців.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
        "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800"
      ]),
      categoryId: categoryRecords.find(c => c.slug === "electronics")!.id,
      sellerId: seller.id,
      type: "BUY_NOW",
      startPrice: 42000,
      currentPrice: 42000,
      buyNowPrice: 42000,
      bidStep: 500,
      status: "ACTIVE",
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 48),
      deliveryOptions: JSON.stringify(["NOVA_POSHTA", "UKR_POSHTA", "COURIER"]),
    }
  });

  const listing3 = await prisma.listing.create({
    data: {
      title: "Золота монета Микола II 10 рублів (1899 р.)",
      description: "Рідкісна золота монета часів царської Росії. Вага: 8.6 грама. Проба золота: 900. Стан Excellent/UNC, чудовий штемпельний блиск, мінімальний знос. Ідеальний предмет для колекції або інвестицій. Оригінальність гарантована.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800",
        "https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=800"
      ]),
      categoryId: categoryRecords.find(c => c.slug === "antiques")!.id,
      sellerId: seller.id,
      type: "AUCTION",
      startPrice: 18000,
      currentPrice: 22600,
      bidStep: 200,
      status: "ACTIVE",
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 3),
      deliveryOptions: JSON.stringify(["NOVA_POSHTA", "UKR_POSHTA"]),
    }
  });

  console.log("Listings created.");

  // 4. Створення ставок (Bids)
  await prisma.bid.deleteMany({});
  await prisma.bid.createMany({
    data: [
      { amount: 430000, bidderId: buyer.id, listingId: listing1.id },
      { amount: 440000, bidderId: admin.id, listingId: listing1.id },
      { amount: 460000, bidderId: buyer.id, listingId: listing1.id },
      { amount: 21000, bidderId: buyer.id, listingId: listing3.id },
      { amount: 22600, bidderId: admin.id, listingId: listing3.id },
    ]
  });
  console.log("Bids created.");

  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
