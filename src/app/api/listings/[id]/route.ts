import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const listing = await prisma.listing.findUnique({
      where: { id }
    });
    
    if (!listing) {
      return NextResponse.json({ error: "Лот не знайдено" }, { status: 404 });
    }

    return NextResponse.json({ 
      listing: { ...listing, createdAt: listing.createdAt.toISOString() } 
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
