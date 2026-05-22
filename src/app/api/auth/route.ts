import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { COOKIE_NAME, createSessionToken, readSessionToken, sessionCookieOptions } from "@/lib/session";

function publicUser(user: any) {
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

function setSession(response: NextResponse, user: any) {
  response.cookies.set(COOKIE_NAME, createSessionToken(publicUser(user)), sessionCookieOptions());
  return response;
}

async function findUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? publicUser(user) : null;
}

async function findUserByEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  return user ? publicUser(user) : null;
}

async function findUserByRole(role: string) {
  const user = await prisma.user.findFirst({ where: { role } });
  return user ? publicUser(user) : null;
}

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const signedUser = readSessionToken(cookie);
  if (signedUser) return NextResponse.json({ user: signedUser });

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
        const dbUser = await prisma.user.update({
          where: { id: signedUser.id },
          data: { balance: { increment: parseFloat(amount) } }
        });
        const pub = publicUser(dbUser);
        return setSession(NextResponse.json({ success: true, user: pub }), dbUser);
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
