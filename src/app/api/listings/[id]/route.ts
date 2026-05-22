import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        seller: true,
        category: true,
        _count: {
          select: { bids: true },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Лот не знайдено" }, { status: 404 });
    }

    let parsedImages = [];
    let parsedDelivery = [];
    try {
      parsedImages = JSON.parse(listing.images);
    } catch {
      parsedImages = [listing.images];
    }
    try {
      parsedDelivery = JSON.parse(listing.deliveryOptions);
    } catch {
      parsedDelivery = [];
    }

    const formattedListing = {
      ...listing,
      images: parsedImages,
      deliveryOptions: parsedDelivery,
      bidsCount: listing._count.bids,
      endDate: listing.endDate.toISOString(),
      createdAt: listing.createdAt.toISOString(),
    };

    return NextResponse.json({ listing: formattedListing });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
