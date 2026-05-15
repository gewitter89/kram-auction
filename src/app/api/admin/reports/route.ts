import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-config'

async function checkAdmin() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return null
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (user?.role !== 'admin' && user?.email !== 'admin@lotva.ua' && user?.email !== 'admin@kram.ua') return null
  return user
}

export async function GET() {
  const admin = await checkAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      listing: { 
        select: { 
          id: true, 
          title: true, 
          seller: { select: { name: true } } 
        } 
      }
    }
  })

  return NextResponse.json(reports)
}

export async function PATCH(request: Request) {
  const admin = await checkAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { reportId, status } = await request.json()

  await prisma.report.update({
    where: { id: reportId },
    data: { status }
  })

  return NextResponse.json({ success: true })
}
