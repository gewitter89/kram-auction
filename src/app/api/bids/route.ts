import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { globalEmitter } from "@/lib/events";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("listingId");
  if (!listingId) return NextResponse.json({ error: "Не вказано listingId" }, { status: 400 });

  try {
    const bids = await prisma.bid.findMany({ where: { listingId }, include: { bidder: true }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ bids: bids.map((b) => ({ id: b.id, amount: b.amount, bidderId: b.bidderId, listingId: b.listingId, createdAt: b.createdAt.toISOString(), bidderName: b.bidder.name })) });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { listingId, bidderId, amount } = await req.json();
    if (!listingId || !bidderId || !amount) return NextResponse.json({ error: "Відсутні обов’язкові поля" }, { status: 400 });
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return NextResponse.json({ error: "Некоректна сума ставки" }, { status: 400 });

    const bidder = await prisma.user.findUnique({ where: { id: bidderId } });
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!bidder) return NextResponse.json({ error: "Користувача не знайдено" }, { status: 404 });
    if (!listing) return NextResponse.json({ error: "Лот не знайдено" }, { status: 404 });
    if (bidder.id === listing.sellerId) return NextResponse.json({ error: "Ви не можете робити ставки на свій власний лот!" }, { status: 400 });
    if (bidder.balance < numericAmount) return NextResponse.json({ error: "Недостатньо коштів на балансі для здійснення цієї ставки!" }, { status: 400 });
    if (numericAmount <= listing.currentPrice) return NextResponse.json({ error: `Ставка повинна бути вищою за поточну ціну (${listing.currentPrice} UAH)` }, { status: 400 });
    
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the new bid
      const newBid = await tx.bid.create({ data: { amount: numericAmount, bidderId, listingId }, include: { bidder: true } });
      // 2. Update listing current price
      await tx.listing.update({ where: { id: listingId }, data: { currentPrice: numericAmount } });
      // 3. Notify seller
      await tx.notification.create({ data: { userId: listing.sellerId, text: `Нова ставка на ваш лот "${listing.title}": ${numericAmount.toLocaleString()} UAH`, type: "BID" } });
      return newBid;
    });
    
    const bid = { id: result.id, amount: result.amount, bidderId: result.bidderId, listingId: result.listingId, createdAt: result.createdAt.toISOString(), bidderName: result.bidder.name };
    globalEmitter.emit("update", { type: "BID", listingId, bid, currentPrice: numericAmount });
    return NextResponse.json({ success: true, bid });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
