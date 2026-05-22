import { EventEmitter } from "events";

// Global cache to prevent multiple EventEmitters during Next.js hot-reloads
const globalForEvents = globalThis as unknown as {
  globalEmitter: EventEmitter | undefined;
};

export const globalEmitter = globalForEvents.globalEmitter ?? new EventEmitter();

if (process.env.NODE_ENV !== "production") {
  globalForEvents.globalEmitter = globalEmitter;
}

// Max listeners limit increase for handling multiple tabs
globalEmitter.setMaxListeners(100);
