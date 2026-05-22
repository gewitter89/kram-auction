import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
      include: {
        _count: {
          select: { bids: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const categories = await prisma.category.findMany();

    // Map database model to frontend format (parse JSON images and delivery options, format bidsCount)
    const formattedListings = listings.map((l) => {
      let parsedImages = [];
      let parsedDelivery = [];
      try {
        parsedImages = JSON.parse(l.images);
      } catch {
        parsedImages = [l.images];
      }
      try {
        parsedDelivery = JSON.parse(l.deliveryOptions);
      } catch {
        parsedDelivery = [];
      }

      return {
        ...l,
        images: parsedImages,
        deliveryOptions: parsedDelivery,
        bidsCount: l._count.bids,
        endDate: l.endDate.toISOString(),
        createdAt: l.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ listings: formattedListings, categories });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      images,
      categoryId,
      sellerId,
      type,
      startPrice,
      buyNowPrice,
      bidStep,
      endDate,
      deliveryOptions,
    } = body;

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

    return NextResponse.json({
      success: true,
      listing: {
        ...newListing,
        images: images || [],
        deliveryOptions: deliveryOptions || [],
        bidsCount: 0,
        endDate: newListing.endDate.toISOString(),
        createdAt: newListing.createdAt.toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
