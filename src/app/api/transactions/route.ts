import { NextRequest, NextResponse } from "next/server";
import { prisma, mockDb } from "@/lib/db";
import { globalEmitter } from "@/lib/events";

export async function GET(req: NextRequest) {
  const userId = new URL(req.url).searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Не вказано userId" }, { status: 400 });
  try {
    const transactions = await prisma.transaction.findMany({ where: { OR: [{ buyerId: userId }, { sellerId: userId }] }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ transactions: transactions.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() })) });
  } catch (error) {
    console.warn("Prisma transactions unavailable, using memory fallback:", error);
    return NextResponse.json({ transactions: mockDb.getTransactions(userId), source: "memory-fallback" });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { listingId, buyerId, deliveryProvider } = await req.json();
    if (!listingId || !buyerId || !deliveryProvider) return NextResponse.json({ error: "Відсутні обов’язкові поля" }, { status: 400 });
    try {
      const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
      const listing = await prisma.listing.findUnique({ where: { id: listingId } });
      if (!buyer) return NextResponse.json({ error: "Покупця не знайдено" }, { status: 404 });
      if (!listing) return NextResponse.json({ error: "Лот не знайдено" }, { status: 404 });
      if (listing.status !== "ACTIVE") return NextResponse.json({ error: "Цей лот вже завершений" }, { status: 400 });
      if (!listing.buyNowPrice) return NextResponse.json({ error: "Цей лот не має фіксованої ціни Бліц" }, { status: 400 });
      if (buyer.balance < listing.buyNowPrice) return NextResponse.json({ error: "Недостатньо коштів на балансі для здійснення купівлі!" }, { status: 400 });
      const ttn = deliveryProvider === "NOVA_POSHTA" ? `204500${Math.floor(100000 + Math.random() * 900000)}` : `UA${Math.floor(100000000 + Math.random() * 900000000)}`;
      const transaction = await prisma.$transaction(async (tx) => {
        await tx.user.update({ where: { id: buyerId }, data: { balance: { decrement: listing.buyNowPrice! } } });
        await tx.user.update({ where: { id: listing.sellerId }, data: { balance: { increment: listing.buyNowPrice! } } });
        await tx.listing.update({ where: { id: listingId }, data: { status: "COMPLETED" } });
        return tx.transaction.create({ data: { amount: listing.buyNowPrice!, listingId, buyerId, sellerId: listing.sellerId, deliveryProvider, deliveryStatus: "PENDING", paymentStatus: "PAID", ttn } });
      });
      const formatted = { ...transaction, createdAt: transaction.createdAt.toISOString() };
      globalEmitter.emit("update", { type: "BUY_NOW", listingId, transaction: formatted });
      return NextResponse.json({ success: true, transaction: formatted });
    } catch (error) {
      console.warn("Prisma transaction unavailable, using memory fallback:", error);
      const transaction = mockDb.buyListingNow(listingId, buyerId, deliveryProvider);
      globalEmitter.emit("update", { type: "BUY_NOW", listingId, transaction });
      return NextResponse.json({ success: true, transaction, source: "memory-fallback" });
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
