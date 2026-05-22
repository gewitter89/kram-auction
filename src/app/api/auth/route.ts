import { NextRequest, NextResponse } from "next/server";
import { prisma, mockDb, MockUser } from "@/lib/db";
import { COOKIE_NAME, createSessionToken, readSessionToken, sessionCookieOptions } from "@/lib/session";

function publicUser(user: MockUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    rating: user.rating,
    verified: user.verified,
    balance: user.balance,
  };
}

function setSession(response: NextResponse, user: MockUser) {
  response.cookies.set(COOKIE_NAME, createSessionToken(publicUser(user)), sessionCookieOptions());
  return response;
}

async function findUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (user) return publicUser(user as MockUser);
  } catch (error) {
    console.warn("Prisma unavailable, using memory auth fallback:", error);
  }
  return mockDb.getUserById(id) || null;
}

async function findUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) return publicUser(user as MockUser);
  } catch (error) {
    console.warn("Prisma unavailable, using memory auth fallback:", error);
  }
  return mockDb.getUserByEmail(email) || null;
}

async function findUserByRole(role: string) {
  try {
    const user = await prisma.user.findFirst({ where: { role } });
    if (user) return publicUser(user as MockUser);
  } catch (error) {
    console.warn("Prisma unavailable, using memory auth fallback:", error);
  }
  return mockDb.getUsers().find((u) => u.role === role) || null;
}

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const signedUser = readSessionToken(cookie);
  if (signedUser) return NextResponse.json({ user: signedUser });

  // Legacy support for old sessions that stored only the user id.
  if (!cookie) return NextResponse.json({ user: null });

  const user = await findUserById(cookie);
  return NextResponse.json({ user });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, role } = body;

    if (action === "logout") {
      const response = NextResponse.json({ success: true });
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    if (action === "switch") {
      const user = await findUserByRole(role);
      if (!user) return NextResponse.json({ error: `Користувач з роллю ${role} не знайдений` }, { status: 404 });
      return setSession(NextResponse.json({ success: true, user }), user);
    }

    if (action === "update_balance") {
      const { amount } = body;
      const cookie = req.cookies.get(COOKIE_NAME)?.value;
      const signedUser = readSessionToken(cookie);
      if (signedUser) {
        const updated = { ...signedUser, balance: signedUser.balance + parseFloat(amount) };
        return setSession(NextResponse.json({ success: true, user: updated }), updated);
      }
      return NextResponse.json({ error: "Неавторизовано" }, { status: 401 });
    }

    if (!email) return NextResponse.json({ error: "Email обов’язковий" }, { status: 400 });

    const user = await findUserByEmail(email);
    if (!user) return NextResponse.json({ error: "Користувача не знайдено" }, { status: 404 });

    return setSession(NextResponse.json({ success: true, user }), user);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
