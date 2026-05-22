import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = new URL(req.url).searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Не вказано userId" }, { status: 400 });

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ notifications });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, text, type, markAllAsRead } = await req.json();

    if (!userId) return NextResponse.json({ error: "Не вказано userId" }, { status: 400 });

    try {
      if (markAllAsRead) {
        await prisma.notification.updateMany({
          where: { userId, isRead: false },
          data: { isRead: true }
        });
        return NextResponse.json({ success: true });
      }

      if (text) {
        const notif = await prisma.notification.create({
          data: { userId, text, type: type || "INFO", isRead: false }
        });
        return NextResponse.json({ success: true, notification: notif });
      }

      return NextResponse.json({ error: "No action provided" }, { status: 400 });
    } catch (error) {
      return NextResponse.json({ error: String(error) }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
