import crypto from "crypto";
import { MockUser } from "@/lib/db";

const COOKIE_NAME = "kram_session";
const SESSION_PREFIX = "v1";

export type SessionUser = MockUser;

function secret() {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "kram-dev-session-secret-change-in-production";
}

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(user: SessionUser) {
  const payload = base64url(JSON.stringify(user));
  const sig = sign(payload);
  return `${SESSION_PREFIX}.${payload}.${sig}`;
}

export function readSessionToken(value?: string): SessionUser | null {
  if (!value || !value.startsWith(`${SESSION_PREFIX}.`)) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [, payload, sig] = parts;
  const expected = sign(payload);
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export { COOKIE_NAME };
