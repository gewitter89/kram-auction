'use client'

import { useEffect } from 'react'

/**
 * Client-side React hook to listen for real-time channel events.
 * Supports both:
 * 1. 3-argument signature: useRealtimeSubscription(channel, event, callback)
 * 2. 2-argument signature: useRealtimeSubscription(channel, callback) (infers event based on channel)
 */
export function useRealtimeSubscription(
  channel: string,
  eventOrCallback: string | ((data: any) => void),
  onEventReceived?: (data: any) => void
) {
  useEffect(() => {
    let eventName = 'update'
    let callback: (data: any) => void

    if (typeof eventOrCallback === 'function') {
      callback = eventOrCallback
      // Dynamic inference of events for backward compatibility
      if (channel === 'global') {
        eventName = 'bid'
      } else if (channel.startsWith('lot_')) {
        eventName = 'new_bid'
      } else if (channel.startsWith('user_')) {
        eventName = 'outbid'
      }
    } else {
      eventName = eventOrCallback
      callback = onEventReceived!
    }

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER

    let pusherInstance: any = null
    let eventSourceInstance: EventSource | null = null

    // Mode A: Pusher WebSockets (if keys exist)
    if (pusherKey && pusherCluster) {
      import('pusher-js').then(({ default: Pusher }) => {
        pusherInstance = new Pusher(pusherKey, {
          cluster: pusherCluster,
        })
        const subChannel = pusherInstance.subscribe(channel)
        subChannel.bind(eventName, callback)
      }).catch(err => {
        console.error('Failed to load pusher-js client:', err)
      })
    } else {
      // Mode B: Local Server-Sent Events (SSE) Fallback
      const sseUrl = `/api/events?channel=${encodeURIComponent(channel)}`
      const es = new EventSource(sseUrl)
      eventSourceInstance = es

      es.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data)
          callback(parsed)
        } catch (err) {
          console.error('Failed to parse SSE event message payload:', err)
        }
      }

      es.onerror = () => {
        console.warn('EventSource SSE connection lost or disconnected.')
      }
    }

    // Clean up connections on unmount/re-effect
    return () => {
      if (pusherInstance) {
        pusherInstance.unsubscribe(channel)
        pusherInstance.disconnect()
      }
      if (eventSourceInstance) {
        eventSourceInstance.close()
      }
    }
  }, [channel, eventOrCallback, onEventReceived])
}
