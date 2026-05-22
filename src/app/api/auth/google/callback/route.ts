import { NextRequest, NextResponse } from "next/server";
import { prisma, MockUser } from "@/lib/db";
import { COOKIE_NAME, createSessionToken, sessionCookieOptions } from "@/lib/session";

function errorPage(message: string, status = 400) {
  return new NextResponse(`<!doctype html><meta charset="utf-8"><body style="font-family:system-ui;background:#020617;color:white;padding:40px"><h1>Google login error</h1><p>${message}</p><p><a style="color:#10b981" href="/">Повернутися на KRAM</a></p></body>`, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

async function exchangeCode(code: string, redirectUri: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: (process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID) || "",
      client_secret: (process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET) || "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ access_token: string }>;
}

async function getGoogleUser(accessToken: string) {
  const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ sub: string; email: string; name?: string; picture?: string; email_verified?: boolean }>;
}

export async function GET(req: NextRequest) {
  const clientId = (process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID);
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET);
  if (!clientId || !clientSecret) {
    return errorPage("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET не додані в Vercel Environment Variables.", 500);
  }

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const savedState = req.cookies.get("kram_google_oauth_state")?.value;
  if (!code) return errorPage("Google не повернув authorization code.");
  if (!state || !savedState || state !== savedState) return errorPage("OAuth state не співпав. Спробуйте ще раз.");

  try {
    const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.AUTH_URL || process.env.NEXTAUTH_URL || req.nextUrl.origin;
    const redirectUri = `${origin}/api/auth/google/callback`;
    const token = await exchangeCode(code, redirectUri);
    const profile = await getGoogleUser(token.access_token);

    const user: MockUser = {
      id: `google-${profile.sub}`,
      email: profile.email,
      name: profile.name || profile.email,
      avatar: profile.picture || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(profile.email)}`,
      role: "BUYER",
      rating: 5,
      verified: Boolean(profile.email_verified),
      balance: 10000,
    };

    try {
      await prisma.user.upsert({
        where: { email: user.email },
        update: { name: user.name, avatar: user.avatar, verified: user.verified },
        create: { ...user, password: "google-oauth" },
      });
    } catch (error) {
      console.warn("Google user saved only in signed session because database is unavailable:", error);
    }

    const response = NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    response.cookies.delete("kram_google_oauth_state");
    response.cookies.set(COOKIE_NAME, createSessionToken(user), sessionCookieOptions());
    return response;
  } catch (error) {
    return errorPage(String(error), 500);
  }
}
