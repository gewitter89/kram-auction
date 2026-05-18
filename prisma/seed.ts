import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const prisma = new PrismaClient()

// SAFETY: Prevent QA seed from running in production
const isProduction = process.env.NODE_ENV === 'production'
const allowQaSeed = process.env.ALLOW_QA_SEED === 'true'
const qaSeedPassword = process.env.QA_SEED_PASSWORD || crypto.randomBytes(8).toString('hex')

if (isProduction && !allowQaSeed) {
  console.log('❌ Production detected. QA seed disabled.')
  console.log('   Set ALLOW_QA_SEED=true to enable (not recommended for live production).')
  process.exit(0)
}

async function main() {
  console.log('🌱 Seeding database...')
  
  if (!isProduction) {
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`   QA Password: ${qaSeedPassword}`)
  }

  // Categories — upsert (safe to run multiple times)
  const categoriesData = [
    { name: 'Електроніка', slug: 'electronics', icon: 'Laptop' },
    { name: 'Телефони', slug: 'phones', icon: 'Smartphone' },
    { name: 'Ноутбуки та ПК', slug: 'laptops', icon: 'Monitor' },
    { name: 'Авто', slug: 'auto', icon: 'Car' },
    { name: 'Одяг', slug: 'fashion', icon: 'Shirt' },
    { name: 'Дім', slug: 'home', icon: 'Home' },
    { name: 'Дитячі товари', slug: 'kids', icon: 'Baby' },
    { name: 'Спорт', slug: 'sport', icon: 'Dumbbell' },
    { name: 'Книги', slug: 'books', icon: 'BookOpen' },
    { name: 'Інструменти', slug: 'tools', icon: 'Wrench' },
    { name: 'Ігри', slug: 'games', icon: 'Gamepad' },
    { name: 'Колекції', slug: 'collections', icon: 'Package' },
  ]

  const categories = await Promise.all(
    categoriesData.map(c =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: {},
        create: c,
      })
    )
  )
  console.log(`  ✅ ${categories.length} categories`)

  // Users — upsert by email
  const prodHash = bcrypt.hashSync('password123', 10)
  // QA users use generated password (not published)
  const qaHash = bcrypt.hashSync(qaSeedPassword, 10)
  
  const usersData = [
    { name: 'Admin KRAM', email: 'admin@kram.ua', passwordHash: prodHash, role: 'admin', city: 'Київ', verified: true, rating: 5.0 },
    { name: 'TechStoreUA', email: 'tech@test.com', passwordHash: prodHash, role: 'seller', city: 'Київ', verified: true, rating: 4.9, bio: 'Техніка з Європи. Гарантія.' },
    { name: 'AppleZone', email: 'apple@test.com', passwordHash: prodHash, role: 'seller', city: 'Харків', verified: true, rating: 4.8 },
    { name: 'GameHub', email: 'game@test.com', passwordHash: prodHash, role: 'seller', city: 'Одеса', verified: true, rating: 4.7 },
    { name: 'HomeStore', email: 'home@test.com', passwordHash: prodHash, role: 'seller', city: 'Дніпро', verified: false, rating: 4.6 },
    { name: 'Покупець Іван', email: 'ivan@test.com', passwordHash: prodHash, city: 'Львів', rating: 4.5 },
    { name: 'Марія К.', email: 'maria@test.com', passwordHash: prodHash, city: 'Вінниця', rating: 4.3 },
    { name: 'DroneUA', email: 'drone@test.com', passwordHash: prodHash, role: 'seller', city: 'Запоріжжя', verified: true, rating: 4.9 },
    { name: 'BikeShop', email: 'bike@test.com', passwordHash: prodHash, role: 'seller', city: 'Полтава', verified: true, rating: 4.8 },
    { name: 'Олексій П.', email: 'alex@test.com', passwordHash: prodHash, city: 'Київ', rating: 4.0 },
    // QA Test Users (for staging/preview only) - use generated password
    { name: 'QA Seller', email: 'qa-seller@kram.local', passwordHash: qaHash, role: 'seller', city: 'Київ', verified: false, rating: 0, bio: 'Тестовий продавець для QA' },
    { name: 'QA Buyer', email: 'qa-buyer@kram.local', passwordHash: qaHash, role: 'user', city: 'Львів', rating: 0 },
    { name: 'QA Admin', email: 'qa-admin@kram.local', passwordHash: qaHash, role: 'admin', city: 'Київ', verified: true, rating: 5.0 },
  ]

  const users = await Promise.all(
    usersData.map(u =>
      prisma.user.upsert({
        where: { email: u.email },
        update: { rating: u.rating, verified: u.verified ?? false },
        create: {
          name: u.name,
          email: u.email,
          passwordHash: u.passwordHash,
          role: u.role ?? 'user',
          city: u.city ?? '',
          verified: u.verified ?? false,
          rating: u.rating,
          bio: u.bio ?? null,
        },
      })
    )
  )
  console.log(`  ✅ ${users.length} users`)

  // Check if listings already exist — skip if so
  const existingCount = await prisma.listing.count()
  if (existingCount > 0) {
    console.log(`  ℹ️  Listings already exist (${existingCount}), skipping`)
    console.log('\n✨ Seed completed!')
    return
  }

  // Listings with real images
  const listings = [
    { title: 'MacBook Air M2 256GB Midnight', desc: 'Стан ідеальний, повний комплект, гарантія Apple. Акумулятор 99%.', cat: 2, seller: 1, price: 28000, city: 'Київ', condition: 'like_new', hours: 3, img: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&q=80' },
    { title: 'iPhone 14 Pro 128GB Deep Purple', desc: 'Без подряпин, батарея 96%, повний комплект.', cat: 1, seller: 2, price: 18500, city: 'Харків', condition: 'like_new', hours: 5, img: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=600&q=80' },
    { title: 'PlayStation 5 Digital + 2 DualSense', desc: 'Прошивка остання, все працює ідеально. В комплекті 5 ігор.', cat: 10, seller: 3, price: 12800, city: 'Одеса', condition: 'used', hours: 1, img: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600&q=80' },
    { title: 'Dyson V15 Detect бездротовий пилосос', desc: 'Новий, запакований, офіційна гарантія 2 роки.', cat: 5, seller: 4, price: 8900, city: 'Дніпро', condition: 'new', hours: 8, img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
    { title: 'Dell Latitude 7490 i5/16Gb/256SSD', desc: 'Бізнес-клас, IPS матриця, підсвітка клавіатури.', cat: 2, seller: 1, price: 4250, city: 'Київ', condition: 'used', hours: 2, img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80' },
    { title: 'Samsung Galaxy Watch 6 Classic 47mm', desc: 'Новий, повний комплект, гарантія Samsung.', cat: 0, seller: 1, price: 5200, city: 'Київ', condition: 'new', hours: 12, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80' },
    { title: 'DJI Mini 3 Pro з пультом RC', desc: 'Ідеальний стан, 2 батареї, кейс. Наліт 50 годин.', cat: 0, seller: 7, price: 22500, city: 'Запоріжжя', condition: 'like_new', hours: 6, img: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&q=80' },
    { title: 'Nintendo Switch OLED + 5 ігор', desc: 'Повний комплект, чохол, захисне скло.', cat: 10, seller: 3, price: 9800, city: 'Одеса', condition: 'used', hours: 4, img: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&q=80' },
    { title: 'Canon EOS R6 Mark II Body', desc: 'Пробіг 5000 кадрів, ідеальний стан. Зберігалась у сумці.', cat: 0, seller: 7, price: 65000, city: 'Запоріжжя', condition: 'like_new', hours: 48, img: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80' },
    { title: 'AirPods Pro 2 USB-C', desc: 'Нові, запаковані. Активне шумозаглушення.', cat: 0, seller: 2, price: 5800, city: 'Харків', condition: 'new', hours: 10, img: 'https://images.unsplash.com/photo-1588423771073-b8903febb85b?w=600&q=80' },
    { title: 'iPad Pro 11" M2 128GB Wi-Fi', desc: 'Стан 10/10, Apple Pencil 2 в комплекті.', cat: 0, seller: 2, price: 24000, city: 'Харків', condition: 'like_new', hours: 7, img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80' },
    { title: 'Кросівки Nike Air Max 90 (43)', desc: 'Оригінал, одягнуті 2 рази. Коробка та всі документи.', cat: 4, seller: 4, price: 2800, city: 'Дніпро', condition: 'like_new', hours: 20, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' },
    { title: 'Samsung Galaxy S24 Ultra 256GB', desc: 'Новий, запакований, гарантія 2 роки. Titanium Black.', cat: 1, seller: 2, price: 38000, city: 'Харків', condition: 'new', hours: 11, img: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80' },
    { title: 'Кавомашина DeLonghi Magnifica S', desc: 'Автоматична, повне ТО, працює ідеально.', cat: 5, seller: 4, price: 5500, city: 'Дніпро', condition: 'used', hours: 15, img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80' },
    { title: 'Монітор LG 27" 4K IPS USB-C', desc: 'Ідеальний для MacBook, HDR400. Без дефектів.', cat: 2, seller: 1, price: 8500, city: 'Київ', condition: 'used', hours: 9, img: 'https://images.unsplash.com/photo-1527443224154-c4a573d5f5a5?w=600&q=80' },
    { title: 'Електросамокат Xiaomi Pro 2', desc: 'Пробіг 200 км, батарея 95%.', cat: 7, seller: 8, price: 7200, city: 'Полтава', condition: 'used', hours: 14, img: 'https://images.unsplash.com/photo-1600777489330-36d1a683f7ee?w=600&q=80' },
    { title: 'Планшет Samsung Galaxy Tab S9', desc: 'Новий, S Pen в комплекті. AMOLED 120Hz.', cat: 0, seller: 1, price: 19500, city: 'Київ', condition: 'new', hours: 8, img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80' },
    { title: 'Проектор Xgimi Halo+', desc: 'Портативний, Full HD, Harman Kardon. Автофокус.', cat: 0, seller: 1, price: 14500, city: 'Київ', condition: 'like_new', hours: 17, img: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&q=80' },
    { title: 'Годинник Casio G-Shock GA-2100', desc: 'CasiOak, новий, повний комплект з коробкою.', cat: 11, seller: 3, price: 3500, city: 'Одеса', condition: 'new', hours: 21, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80' },
    { title: 'Велосипед Giant Talon 29" 2023', desc: 'Рама L, пробіг 500 км. Shimano Deore 12 передач.', cat: 7, seller: 8, price: 15600, city: 'Полтава', condition: 'used', hours: 24, img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
    // QA Test Listing (for staging/preview only)
    { title: 'Тестовий QA-лот KRAM', desc: 'Демо-лот для перевірки ставок, скарг та модерації. Не є реальним товаром.', cat: 0, seller: 10, price: 100, city: 'Київ', condition: 'new', hours: 1, img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  ]

  const createdListings = []
  for (const l of listings) {
    const listing = await prisma.listing.create({
      data: {
        title: l.title,
        description: l.desc,
        images: JSON.stringify([l.img]),
        categoryId: categories[l.cat]?.id || categories[0].id,
        sellerId: users[l.seller]?.id || users[0].id,
        condition: l.condition,
        city: l.city,
        type: Math.random() > 0.3 ? 'auction' : 'both',
        startPrice: Math.round(l.price * 0.3),
        currentPrice: l.price,
        buyNowPrice: Math.random() > 0.5 ? Math.round(l.price * 1.35) : null,
        minIncrement: l.price > 10000 ? 500 : l.price > 5000 ? 200 : 50,
        duration: 7,
        endsAt: new Date(Date.now() + l.hours * 3600000),
        delivery: 'nova_poshta',
        views: Math.floor(Math.random() * 500) + 50,
      }
    })
    createdListings.push(listing)
  }
  console.log(`  ✅ ${createdListings.length} listings`)

  // Bids for first 15 listings
  let bidCount = 0
  for (const listing of createdListings.slice(0, 15)) {
    const numBids = Math.floor(Math.random() * 8) + 2
    let price = listing.startPrice
    for (let i = 0; i < numBids; i++) {
      price += listing.minIncrement * (Math.floor(Math.random() * 3) + 1)
      const bidderIdx = Math.floor(Math.random() * users.length)
      const bidder = users[bidderIdx]
      if (bidder.id === listing.sellerId) continue
      await prisma.bid.create({
        data: {
          listingId: listing.id,
          userId: bidder.id,
          amount: price,
          createdAt: new Date(Date.now() - (numBids - i) * 3600000)
        }
      })
      await prisma.listing.update({
        where: { id: listing.id },
        data: { currentPrice: price }
      })
      bidCount++
    }
  }
  console.log(`  ✅ ${bidCount} bids`)

  console.log('\n✨ Seed completed!')
  console.log('\n📋 Production Test accounts:')
  console.log('  Admin: admin@kram.ua / password123')
  console.log('  Seller: tech@test.com / password123')
  console.log('  Buyer: ivan@test.com / password123')
  
  if (!isProduction) {
    console.log('\n📋 QA Test accounts (staging/preview only):')
    console.log(`  QA Seller: qa-seller@kram.local / [QA_SEED_PASSWORD or generated]`)
    console.log(`  QA Buyer: qa-buyer@kram.local / [QA_SEED_PASSWORD or generated]`)
    console.log(`  QA Admin: qa-admin@kram.local / [QA_SEED_PASSWORD or generated]`)
    console.log('  QA Lot: "Тестовий QA-лот KRAM" (1 hour duration for testing)')
    console.log(`\n   ⚠️  QA Password: ${qaSeedPassword}`)
    console.log('   Set QA_SEED_PASSWORD env var to use custom password')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
