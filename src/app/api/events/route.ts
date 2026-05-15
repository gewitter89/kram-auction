import { NextRequest } from 'next/server'
import { eventBus } from '@/lib/eventBus'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const channel = searchParams.get('channel')

  if (!channel) {
    return new Response('Channel is required', { status: 400 })
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      
      const listener = (data: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch (error) {
          // Stream might be closed
        }
      }

      eventBus.on(channel, listener)

      // Initial heartbeat
      try {
        controller.enqueue(encoder.encode(`: heartbeat\n\n`))
      } catch (error) {}

      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`))
        } catch (error) {
          clearInterval(interval)
        }
      }, 15000)

      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        eventBus.off(channel, listener)
        try { controller.close() } catch (error) {}
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  })
}
