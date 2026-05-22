import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { globalEmitter } from "@/lib/events";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Не вказано userId" }, { status: 400 });
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedTxs = transactions.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
    }));

    return NextResponse.json({ transactions: formattedTxs });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listingId, buyerId, deliveryProvider } = body;

    if (!listingId || !buyerId || !deliveryProvider) {
      return NextResponse.json({ error: "Відсутні обов’язкові поля" }, { status: 400 });
    }

    const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });

    if (!buyer) return NextResponse.json({ error: "Покупця не знайдено" }, { status: 404 });
    if (!listing) return NextResponse.json({ error: "Лот не знайдено" }, { status: 404 });
    if (listing.status !== "ACTIVE") return NextResponse.json({ error: "Цей лот вже завершений" }, { status: 400 });
    if (!listing.buyNowPrice) return NextResponse.json({ error: "Цей лот не має фіксованої ціни Бліц" }, { status: 400 });

    if (buyer.balance < listing.buyNowPrice) {
      return NextResponse.json({ error: "Недостатньо коштів на балансі для здійснення купівлі!" }, { status: 400 });
    }

    const ttn = deliveryProvider === "NOVA_POSHTA" 
      ? `204500${Math.floor(100000 + Math.random() * 900000)}` 
      : `UA${Math.floor(100000000 + Math.random() * 900000000)}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Deduct balance from buyer
      const updatedBuyer = await tx.user.update({
        where: { id: buyerId },
        data: { balance: { decrement: listing.buyNowPrice! } },
      });

      // 2. Add balance to seller
      await tx.user.update({
        where: { id: listing.sellerId },
        data: { balance: { increment: listing.buyNowPrice! } },
      });

      // 3. Mark listing as COMPLETED
      const updatedListing = await tx.listing.update({
        where: { id: listingId },
        data: { status: "COMPLETED" },
      });

      // 4. Create Transaction record
      const transaction = await tx.transaction.create({
        data: {
          amount: listing.buyNowPrice!,
          listingId,
          buyerId,
          sellerId: listing.sellerId,
          deliveryProvider,
          deliveryStatus: "PENDING",
          paymentStatus: "PAID",
          ttn,
        },
      });

      // 5. Create notifications
      await tx.notification.create({
        data: {
          userId: buyerId,
          text: `Вітаємо! Ви викупили лот "${listing.title}" за ${listing.buyNowPrice!.toLocaleString()} UAH. Доставка: ${deliveryProvider}, ТТН: ${ttn}`,
          type: "WON",
        },
      });

      await tx.notification.create({
        data: {
          userId: listing.sellerId,
          text: `Ваш лот "${listing.title}" викуплений за ${listing.buyNowPrice!.toLocaleString()} UAH. ТТН для відправки: ${ttn}`,
          type: "SOLD",
        },
      });

      return { transaction, updatedBuyer, updatedListing };
    });

    const formattedTx = {
      ...result.transaction,
      createdAt: result.transaction.createdAt.toISOString(),
    };

    // Emit live SSE update event
    globalEmitter.emit("update", {
      type: "BUY_NOW",
      listingId,
      transaction: formattedTx,
    });

    return NextResponse.json({ success: true, transaction: formattedTx });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
