import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { isRateLimited } from '@/lib/rateLimit'
import { registerSchema, validateBody } from '@/lib/validation'

export async function POST(request: Request) {
  try {
    // Rate limit by IP
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (await isRateLimited(`register:${ip}`, 5, 60_000)) {
      return NextResponse.json({ error: 'Забагато спроб. Спробуйте пізніше.' }, { status: 429 })
    }

    const body = await request.json()
    const validation = validateBody(registerSchema, body)
    if (validation.error) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    const { name, email, password, phone } = validation.data!
    const normalizedEmail = email.toLowerCase().trim()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Імʼя, email та пароль обовʼязкові" }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Пароль має бути мінімум 8 символів' }, { status: 400 })
    }

    const existing = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "User" WHERE email = ${normalizedEmail} LIMIT 1
    `
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Користувач з таким email вже існує' }, { status: 409 })
    }

    const userId = `user_${crypto.randomUUID()}`
    const passwordHash = bcrypt.hashSync(password, 10)

    // Use a minimal SQL insert to remain compatible with production databases that may
    // lag behind the Prisma schema with newer optional profile/verification columns.
    await prisma.$executeRaw`
      INSERT INTO "User" (id, name, email, "passwordHash")
      VALUES (${userId}, ${name.trim()}, ${normalizedEmail}, ${passwordHash})
    `

    return NextResponse.json({ message: 'Реєстрація успішна!' }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
