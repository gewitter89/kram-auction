import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { globalEmitter } from "@/lib/events";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("listingId");

  if (!listingId) {
    return NextResponse.json({ error: "Не вказано listingId" }, { status: 400 });
  }

  try {
    const bids = await prisma.bid.findMany({
      where: { listingId },
      include: { bidder: true },
      orderBy: { createdAt: "desc" },
    });

    const formattedBids = bids.map((b) => ({
      id: b.id,
      amount: b.amount,
      bidderId: b.bidderId,
      listingId: b.listingId,
      createdAt: b.createdAt.toISOString(),
      bidderName: b.bidder.name,
    }));

    return NextResponse.json({ bids: formattedBids });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listingId, bidderId, amount } = body;

    if (!listingId || !bidderId || !amount) {
      return NextResponse.json({ error: "Відсутні обов’язкові поля" }, { status: 400 });
    }

    const numericAmount = parseFloat(amount);

    // Get user and listing to validate
    const bidder = await prisma.user.findUnique({ where: { id: bidderId } });
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });

    if (!bidder) return NextResponse.json({ error: "Користувача не знайдено" }, { status: 404 });
    if (!listing) return NextResponse.json({ error: "Лот не знайдено" }, { status: 404 });

    if (bidder.id === listing.sellerId) {
      return NextResponse.json({ error: "Ви не можете робити ставки на свій власний лот!" }, { status: 400 });
    }

    if (bidder.balance < numericAmount) {
      return NextResponse.json({ error: "Недостатньо коштів на балансі для здійснення цієї ставки!" }, { status: 400 });
    }

    if (numericAmount <= listing.currentPrice) {
      return NextResponse.json({
        error: `Ставка повинна бути вищою за поточну ціну (${listing.currentPrice} UAH)`,
      }, { status: 400 });
    }

    // Run transaction: create bid, update listing price
    const result = await prisma.$transaction(async (tx) => {
      const newBid = await tx.bid.create({
        data: {
          amount: numericAmount,
          bidderId,
          listingId,
        },
        include: { bidder: true },
      });

      const updatedListing = await tx.listing.update({
        where: { id: listingId },
        data: { currentPrice: numericAmount },
      });

      // Create notification for seller
      await tx.notification.create({
        data: {
          userId: listing.sellerId,
          text: `Нова ставка на ваш лот "${listing.title}": ${numericAmount.toLocaleString()} UAH`,
          type: "BID",
        },
      });

      // Find all unique previous bidders on this listing (except the current one and the seller)
      const previousBids = await tx.bid.findMany({
        where: {
          listingId,
          bidderId: { notIn: [bidderId, listing.sellerId] },
        },
        select: { bidderId: true },
        distinct: ["bidderId"],
      });

      // Create outbid notifications
      for (const prevBid of previousBids) {
        await tx.notification.create({
          data: {
            userId: prevBid.bidderId,
            text: `Вашу ставку на лот "${listing.title}" перебили! Нова ставка: ${numericAmount.toLocaleString()} UAH`,
            type: "OUTBID",
          },
        });
      }

      return { newBid, updatedListing };
    });

    const formattedBid = {
      id: result.newBid.id,
      amount: result.newBid.amount,
      bidderId: result.newBid.bidderId,
      listingId: result.newBid.listingId,
      createdAt: result.newBid.createdAt.toISOString(),
      bidderName: result.newBid.bidder.name,
    };

    // Emit live SSE update event
    globalEmitter.emit("update", {
      type: "BID",
      listingId,
      bid: formattedBid,
      currentPrice: numericAmount,
    });

    return NextResponse.json({ success: true, bid: formattedBid });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
