import { EventEmitter } from 'events'

class GlobalEventBus extends EventEmitter {
  constructor() {
    super()
    this.setMaxListeners(100) // Increase for SSE connections
  }
}

declare global {
  var _eventBus: GlobalEventBus | undefined
}

export const eventBus = globalThis._eventBus || new GlobalEventBus()

if (process.env.NODE_ENV !== 'production') {
  globalThis._eventBus = eventBus
}
