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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { seller: true, category: true, _count: { select: { bids: true } } },
    });
    if (!listing) return NextResponse.json({ error: "Лот не знайдено" }, { status: 404 });
    return NextResponse.json({ listing: formatListing(listing) });
  } catch (error) {
    console.warn("Prisma listing unavailable, using memory fallback:", error);
    const listing = mockDb.getListingById(id);
    if (!listing) return NextResponse.json({ error: "Лот не знайдено" }, { status: 404 });
    return NextResponse.json({ listing, source: "memory-fallback" });
  }
}
