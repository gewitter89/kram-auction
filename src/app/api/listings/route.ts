import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PUBLIC_CATEGORIES } from "@/lib/public-data";

function formatListing(l: any) {
  let images: string[] = [];
  let deliveryOptions: string[] = [];
  try { images = Array.isArray(l.images) ? l.images : JSON.parse(l.images); } catch { images = [l.images].filter(Boolean); }
  try { deliveryOptions = Array.isArray(l.deliveryOptions) ? l.deliveryOptions : JSON.parse(l.deliveryOptions); } catch { deliveryOptions = []; }
  return {
    ...l,
    images,
    deliveryOptions,
    bidsCount: l.bidsCount ?? l._count?.bids ?? 0,
    endDate: typeof l.endDate === "string" ? l.endDate : l.endDate?.toISOString?.(),
    createdAt: typeof l.createdAt === "string" ? l.createdAt : l.createdAt?.toISOString?.(),
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");
  const sellerId = searchParams.get("sellerId");

  try {
    const where: { categoryId?: string; sellerId?: string } = {};
    if (categoryId) where.categoryId = categoryId;
    if (sellerId) where.sellerId = sellerId;

    const listings = await prisma.listing.findMany({
      where,
      include: { _count: { select: { bids: true } } },
      orderBy: { createdAt: "desc" },
    });
    const categories = await prisma.category.findMany();
    return NextResponse.json({ listings: listings.map(formatListing), categories: categories.length ? categories : PUBLIC_CATEGORIES });
  } catch (error) {
    console.warn("Listings DB unavailable; returning empty real marketplace state:", error);
    return NextResponse.json({ listings: [], categories: PUBLIC_CATEGORIES, source: "empty-no-database" });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, images, categoryId, sellerId, type, startPrice, buyNowPrice, bidStep, endDate, deliveryOptions } = body;

    const parsedStartPrice = parseFloat(startPrice);
    const parsedBuyNowPrice = buyNowPrice ? parseFloat(buyNowPrice) : null;
    const parsedBidStep = parseFloat(bidStep || 50);

    if (parsedStartPrice <= 0 || (parsedBuyNowPrice && parsedBuyNowPrice <= 0) || parsedBidStep <= 0) {
      return NextResponse.json({ error: "Ціна та крок ставки повинні бути більшими за нуль" }, { status: 400 });
    }

    const newListing = await prisma.listing.create({
      data: {
        title,
        description,
        images: JSON.stringify(images || []),
        categoryId,
        sellerId,
        type,
        startPrice: parsedStartPrice,
        currentPrice: parsedStartPrice,
        buyNowPrice: parsedBuyNowPrice,
        bidStep: parsedBidStep,
        endDate: new Date(endDate),
        deliveryOptions: JSON.stringify(deliveryOptions || []),
        status: "ACTIVE",
      },
    });
    return NextResponse.json({ success: true, listing: formatListing(newListing) });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
