import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userIdCookie = req.cookies.get("kram_session");
  if (!userIdCookie) {
    return NextResponse.json({ user: null });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userIdCookie.value },
    });
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ user: null, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, role } = body;

    // Handle logout
    if (action === "logout") {
      const response = NextResponse.json({ success: true });
      response.cookies.delete("kram_session");
      return response;
    }

    // Quick switch for testing roles (e.g. switch user to BUYER / SELLER / ADMIN)
    if (action === "switch") {
      const user = await prisma.user.findFirst({
        where: { role },
      });
      if (!user) {
        return NextResponse.json({ error: `Користувач з роллю ${role} не знайдений` }, { status: 404 });
      }
      const response = NextResponse.json({ success: true, user });
      response.cookies.set("kram_session", user.id, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return response;
    }

    if (action === "update_balance") {
      const { amount } = body;
      const userIdCookie = req.cookies.get("kram_session");
      if (!userIdCookie) {
        return NextResponse.json({ error: "Неавторизовано" }, { status: 401 });
      }
      const updatedUser = await prisma.user.update({
        where: { id: userIdCookie.value },
        data: { balance: { increment: parseFloat(amount) } },
      });
      return NextResponse.json({ success: true, user: updatedUser });
    }

    // Standard login by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "Користувача не знайдено" }, { status: 404 });
    }

    const response = NextResponse.json({ success: true, user });
    response.cookies.set("kram_session", user.id, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
