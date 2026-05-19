import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { hashToken, isExpired } from '@/lib/auth-tokens'

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()
    if (!token || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Некоректний токен або пароль занадто короткий' }, { status: 400 })
    }

    const hash = hashToken(String(token))
    const records = await prisma.report.findMany({
      where: { reason: 'password_reset_token', status: 'pending' },
      select: { id: true, userId: true, comment: true },
      take: 200,
    })

    const record = records.find(r => {
      try {
        const parsed = JSON.parse(r.comment || '{}')
        return parsed.hash === hash && !isExpired(parsed.expiresAt)
      } catch { return false }
    })

    if (!record) return NextResponse.json({ error: 'Посилання недійсне або прострочене' }, { status: 400 })

    await prisma.user.update({ where: { id: record.userId }, data: { passwordHash: bcrypt.hashSync(password, 10) }, select: { id: true } })
    await prisma.report.update({ where: { id: record.id }, data: { status: 'resolved' } })
    await prisma.notification.create({ data: { userId: record.userId, type: 'password_reset', title: 'Пароль оновлено', message: 'Ваш пароль KRAM було успішно змінено.' } }).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 })
  }
}
