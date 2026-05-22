import { NextRequest, NextResponse } from "next/server";
import { prisma, mockDb } from "@/lib/db";

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
    return NextResponse.json({ listings: listings.map(formatListing), categories });
  } catch (error) {
    console.warn("Prisma listings unavailable, using memory fallback:", error);
    let listings = mockDb.getListings();
    if (categoryId) listings = listings.filter((l) => l.categoryId === categoryId);
    if (sellerId) listings = listings.filter((l) => l.sellerId === sellerId);
    return NextResponse.json({ listings, categories: mockDb.getCategories(), source: "memory-fallback" });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, images, categoryId, sellerId, type, startPrice, buyNowPrice, bidStep, endDate, deliveryOptions } = body;

    try {
      const newListing = await prisma.listing.create({
        data: {
          title,
          description,
          images: JSON.stringify(images || []),
          categoryId,
          sellerId,
          type,
          startPrice: parseFloat(startPrice),
          currentPrice: parseFloat(startPrice),
          buyNowPrice: buyNowPrice ? parseFloat(buyNowPrice) : null,
          bidStep: parseFloat(bidStep || 50),
          endDate: new Date(endDate),
          deliveryOptions: JSON.stringify(deliveryOptions || []),
          status: "ACTIVE",
        },
      });
      return NextResponse.json({ success: true, listing: formatListing(newListing) });
    } catch (error) {
      console.warn("Prisma create listing unavailable, using memory fallback:", error);
      const listing = mockDb.addListing({
        title,
        description,
        images: images || [],
        categoryId,
        sellerId,
        type,
        startPrice: parseFloat(startPrice),
        buyNowPrice: buyNowPrice ? parseFloat(buyNowPrice) : undefined,
        bidStep: parseFloat(bidStep || 50),
        endDate,
        deliveryOptions: deliveryOptions || [],
      });
      return NextResponse.json({ success: true, listing, source: "memory-fallback" });
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
