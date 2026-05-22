import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Не вказано userId" }, { status: 400 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const formattedNotifications = notifications.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
    }));

    return NextResponse.json({ notifications: formattedNotifications });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, text, type } = body;

    if (!userId) {
      return NextResponse.json({ error: "Відсутній userId" }, { status: 400 });
    }

    if (text) {
      const notification = await prisma.notification.create({
        data: {
          userId,
          text,
          type: type || "INFO",
        },
      });
      const formattedNotification = {
        ...notification,
        createdAt: notification.createdAt.toISOString(),
      };
      return NextResponse.json({ success: true, notification: formattedNotification });
    }

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
