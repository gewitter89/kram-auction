import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId, step } = await req.json();

    if (!userId || step === undefined) {
      return NextResponse.json({ error: "Відсутні обов’язкові поля" }, { status: 400 });
    }

    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { verificationStep: Number(step) }
      });
      return NextResponse.json({ success: true, verificationStep: user.verificationStep });
    } catch (error) {
      return NextResponse.json({ error: String(error) }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
