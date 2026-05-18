import { eventBus } from './eventBus'

/**
 * Server-side dynamic real-time broadcast function.
 * Emits to the local eventBus (for local SSE) and triggers Pusher WebSockets if configured in .env.
 */
export async function broadcast(channel: string, event: string, data: any) {
  // 1. Always emit locally for local SSE fallback
  eventBus.emit(channel, data)

  const appId = process.env.PUSHER_APP_ID
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY
  const secret = process.env.PUSHER_SECRET
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER

  // 2. If Pusher config is active, broadcast to Pusher WebSockets
  if (appId && key && secret && cluster) {
    try {
      const Pusher = (await import('pusher')).default
      const pusher = new Pusher({
        appId,
        key,
        secret,
        cluster,
        useTLS: true,
      })
      await pusher.trigger(channel, event, data)
    } catch (error) {
      console.error('Failed to broadcast to Pusher:', error)
    }
  }
}
