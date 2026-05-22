import { NextRequest, NextResponse } from "next/server";
import { prisma, mockDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = new URL(req.url).searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Не вказано userId" }, { status: 400 });
  try {
    const notifications = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ notifications: notifications.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() })) });
  } catch (error) {
    console.warn("Prisma notifications unavailable, using memory fallback:", error);
    return NextResponse.json({ notifications: mockDb.getNotifications(userId), source: "memory-fallback" });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, text, type } = await req.json();
    if (!userId) return NextResponse.json({ error: "Відсутній userId" }, { status: 400 });
    try {
      if (text) {
        const notification = await prisma.notification.create({ data: { userId, text, type: type || "INFO" } });
        return NextResponse.json({ success: true, notification: { ...notification, createdAt: notification.createdAt.toISOString() } });
      }
      await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
      return NextResponse.json({ success: true });
    } catch (error) {
      console.warn("Prisma notification update unavailable, using memory fallback:", error);
      if (text) return NextResponse.json({ success: true, notification: mockDb.addNotification(userId, text, type || "INFO"), source: "memory-fallback" });
      mockDb.notifications.filter((n) => n.userId === userId).forEach((n) => (n.isRead = true));
      return NextResponse.json({ success: true, source: "memory-fallback" });
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
