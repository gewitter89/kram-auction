import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding categories only. No sample users, balances, bids or listings are created.");

  const categories = [
    { name: "Електроніка та гаджети", slug: "electronics", icon: "Laptop" },
    { name: "Одяг та аксесуари", slug: "fashion", icon: "Shirt" },
    { name: "Дім та побут", slug: "home", icon: "Home" },
    { name: "Авто та запчастини", slug: "auto", icon: "Car" },
    { name: "Мистецтво та колекції", slug: "art", icon: "Palette" },
    { name: "Інше", slug: "other", icon: "Package" },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon },
      create: c,
    });
  }

  console.log("Seed finished: categories are ready; marketplace content must come from real users.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
