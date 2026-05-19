import { prisma } from '@/lib/prisma'

export type UserRestrictionLevel = 'limited' | 'blocked' | 'banned'

export type UserRestriction = {
  level: UserRestrictionLevel
  reason: string
  reportId: string
}

export async function getActiveUserRestriction(userId: string): Promise<UserRestriction | null> {
  const record = await prisma.report.findFirst({
    where: {
      userId,
      listingId: null,
      reason: 'user_restriction',
      status: 'action_taken',
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, comment: true },
  })

  if (!record) return null

  try {
    const parsed = JSON.parse(record.comment || '{}')
    const level = parsed.level as UserRestrictionLevel
    if (!['limited', 'blocked', 'banned'].includes(level)) return null
    return { level, reason: parsed.reason || 'Порушення правил платформи', reportId: record.id }
  } catch {
    return { level: 'blocked', reason: record.comment || 'Порушення правил платформи', reportId: record.id }
  }
}

export async function assertUserAllowed(userId: string, action: 'sell' | 'bid' | 'buy' | 'message' | 'verification') {
  const restriction = await getActiveUserRestriction(userId)
  if (!restriction) return

  if (restriction.level === 'limited' && action !== 'sell' && action !== 'verification') return

  const actionLabels: Record<string, string> = {
    sell: 'створювати або редагувати лоти',
    bid: 'робити ставки',
    buy: 'купувати лоти',
    message: 'надсилати повідомлення',
    verification: 'подавати заявку продавця',
  }

  throw new Error(`ACCOUNT_RESTRICTED:${restriction.level}:${actionLabels[action]}:${restriction.reason}`)
}

export function restrictionErrorMessage(error: unknown) {
  if (!(error instanceof Error) || !error.message.startsWith('ACCOUNT_RESTRICTED:')) return null
  const [, level, action, reason] = error.message.split(':')
  const label = level === 'limited' ? 'обмежено' : level === 'banned' ? 'заблоковано' : 'тимчасово заблоковано'
  return `Ваш акаунт ${label}. Ви не можете ${action}. Причина: ${reason || 'порушення правил платформи'}`
}
