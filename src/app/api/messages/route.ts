import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { globalEmitter } from "@/lib/events";

function fraudWarning(text: string) {
  const phonePattern = /(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{2}[- ]?\d{2}/g;
  const linksPattern = /(?:https?:\/\/)?(?:t\.me|viber|instagram|facebook|olx|vk)\.[a-z]{2,6}\b/i;
  const telegramUsernamePattern = /@[a-zA-Z0-9_]{5,32}/;
  return phonePattern.test(text) || linksPattern.test(text) || telegramUsernamePattern.test(text)
    ? "⚠️ Система безпеки KRAM: Виявлено контактні дані. Настійно рекомендуємо проводити всі угоди виключно всередині чату платформи через Безпечну Угоду."
    : undefined;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("listingId");
  const user1 = searchParams.get("user1");
  const user2 = searchParams.get("user2");
  if (!listingId || !user1 || !user2) return NextResponse.json({ error: "Відсутні обов’язкові параметри" }, { status: 400 });
  try {
    const messages = await prisma.message.findMany({ where: { listingId, OR: [{ senderId: user1, receiverId: user2 }, { senderId: user2, receiverId: user1 }] }, orderBy: { createdAt: "asc" } });
    return NextResponse.json({ messages: messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() })) });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { listingId, senderId, receiverId, text } = await req.json();
    if (!listingId || !senderId || !receiverId || !text) return NextResponse.json({ error: "Відсутні обов’язкові поля" }, { status: 400 });
    const newMessage = await prisma.message.create({ data: { text, senderId, receiverId, listingId, isRead: false } });
    const message = { ...newMessage, createdAt: newMessage.createdAt.toISOString() };
    globalEmitter.emit("update", { type: "MESSAGE", listingId, message });
    return NextResponse.json({ success: true, message, warning: fraudWarning(text) });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
