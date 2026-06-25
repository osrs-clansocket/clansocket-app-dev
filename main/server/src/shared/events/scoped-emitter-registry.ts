import { EventEmitter } from "node:events";

interface RegistryOptions {
    eventName: string;
    maxListeners?: number;
}

export interface ScopedEmitterRegistry<T> {
    broadcast(scope: string, payload: T): void;
    registerListener(scope: string, handler: (payload: T) => void): () => void;
}

function ensureEmitter(emitters: Map<string, EventEmitter>, scope: string, maxListeners: number): EventEmitter {
    let e = emitters.get(scope);
    if (!e) {
        e = new EventEmitter();
        e.setMaxListeners(maxListeners);
        emitters.set(scope, e);
    }
    return e;
}

export function scopedEmitterRegistry<T>(opts: RegistryOptions): ScopedEmitterRegistry<T> {
    const emitters = new Map<string, EventEmitter>();
    const { eventName, maxListeners = 0 } = opts;
    return {
        broadcast(scope, payload) {
            emitters.get(scope)?.emit(eventName, payload);
        },
        registerListener(scope, handler) {
            const e = ensureEmitter(emitters, scope, maxListeners);
            e.on(eventName, handler);
            return () => {
                e.off(eventName, handler);
                if (e.listenerCount(eventName) === 0) emitters.delete(scope);
            };
        },
    };
}
