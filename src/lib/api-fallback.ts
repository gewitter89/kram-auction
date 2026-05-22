import { NextResponse } from "next/server";

export function isPrismaUnavailable(error: unknown) {
  const message = String(error);
  return (
    message.includes("PrismaClientInitializationError") ||
    message.includes("Unable to open the database file") ||
    message.includes("Can't reach database server") ||
    message.includes("Environment variable not found") ||
    message.includes("Database") ||
    message.includes("database")
  );
}

export function serverError(error: unknown) {
  return NextResponse.json({ error: String(error) }, { status: 500 });
}
