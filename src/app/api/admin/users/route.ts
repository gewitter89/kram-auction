import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/getCurrentUser'
import { sendSimpleEventEmail } from '@/lib/email'
import { absoluteUrl } from '@/lib/site-url'

export async function GET(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { email: { contains: query } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verified: true,
        verificationStatus: true,
        emailVerified: true,
        rating: true,
        createdAt: true,
        _count: {
          select: { listings: true, bids: true }
        }
      }
    })

    const restrictions = await prisma.report.findMany({
      where: { userId: { in: users.map(u => u.id) }, reason: 'user_restriction', status: 'action_taken' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, userId: true, comment: true, createdAt: true }
    })
    const notes = await prisma.report.findMany({
      where: { userId: { in: users.map(u => u.id) }, reason: 'moderator_note', status: 'reviewed' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, userId: true, comment: true, createdAt: true },
      take: 200,
    })
    const byUser = new Map<string, any>()
    for (const r of restrictions) {
      if (!r.userId || byUser.has(r.userId)) continue
      try { byUser.set(r.userId, { id: r.id, createdAt: r.createdAt, ...JSON.parse(r.comment || '{}') }) }
      catch { byUser.set(r.userId, { id: r.id, createdAt: r.createdAt, level: 'blocked', reason: r.comment || 'Порушення правил' }) }
    }

    const notesByUser = new Map<string, any[]>()
    for (const note of notes) {
      if (!note.userId) continue
      const arr = notesByUser.get(note.userId) || []
      if (arr.length < 3) arr.push(note)
      notesByUser.set(note.userId, arr)
    }

    return NextResponse.json(users.map(u => ({ ...u, restriction: byUser.get(u.id) || null, moderatorNotes: notesByUser.get(u.id) || [] })))
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin()

    const { userId, action, value } = await request.json()

    if (action === 'setRole') {
      await prisma.user.update({
        where: { id: userId },
        data: { role: value }
      })
    } else if (action === 'setRestriction') {
      const level = ['limited', 'blocked', 'banned'].includes(value?.level) ? value.level : 'blocked'
      const reason = String(value?.reason || 'Порушення правил платформи').slice(0, 500)
      await prisma.report.updateMany({ where: { userId, reason: 'user_restriction', status: 'action_taken' }, data: { status: 'resolved' } })
      await prisma.report.create({ data: { userId, listingId: null, reason: 'user_restriction', comment: JSON.stringify({ level, reason }), status: 'action_taken' } })
      await prisma.notification.create({ data: { userId, type: 'account_restriction', title: 'Обмеження акаунта', message: `Ваш акаунт обмежено (${level}). Причина: ${reason}` } }).catch(() => {})
      const restrictedUser = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } })
      sendSimpleEventEmail({ to: restrictedUser?.email, subject: '⚠️ Обмеження акаунта KRAM', title: 'Ваш акаунт обмежено', message: `Рівень: ${level}. Причина: ${reason}`, ctaUrl: absoluteUrl('/support'), ctaLabel: 'Звернутися в підтримку' }).catch(console.error)
      await prisma.auditLog.create({ data: { userId, action: 'USER_RESTRICTED', metadata: JSON.stringify({ level, reason }) } }).catch(() => {})
    } else if (action === 'clearRestriction') {
      await prisma.report.updateMany({ where: { userId, reason: 'user_restriction', status: 'action_taken' }, data: { status: 'resolved' } })
      await prisma.notification.create({ data: { userId, type: 'account_restriction_cleared', title: 'Обмеження акаунта знято', message: 'Ваш акаунт знову може користуватися функціями KRAM.' } }).catch(() => {})
      await prisma.auditLog.create({ data: { userId, action: 'USER_RESTRICTION_CLEARED' } }).catch(() => {})
    } else if (action === 'addModeratorNote') {
      const note = String(value?.note || '').trim().slice(0, 1000)
      if (!note) return NextResponse.json({ error: 'Note is required' }, { status: 400 })
      await prisma.report.create({ data: { userId, listingId: null, reason: 'moderator_note', comment: note, status: 'reviewed' } })
      await prisma.auditLog.create({ data: { userId, action: 'MODERATOR_NOTE_ADDED', metadata: JSON.stringify({ note }) } }).catch(() => {})
    } else if (action === 'setVerificationStatus') {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          verificationStatus: value,
          // Sync legacy field
          verified: value === 'VERIFIED'
        }
      })
      
      // Audit log (non-blocking)
      try {
        await prisma.auditLog.create({
          data: {
            userId: userId,
            action: value === 'VERIFIED' ? 'USER_VERIFICATION_APPROVED' : 
                    value === 'REJECTED' ? 'USER_VERIFICATION_REJECTED' : 'USER_VERIFICATION_RESET',
            metadata: JSON.stringify({ details: `Verification status changed to ${value}` })
          }
        })
      } catch {
        // Audit log failure should not block main action
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
