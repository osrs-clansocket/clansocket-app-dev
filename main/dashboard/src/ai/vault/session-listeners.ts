import { events, AppEvents } from "../../managers/events";

const listeners = new Set<(unlocked: boolean) => void>();

export function notify(unlocked: boolean): void {
    for (const fn of listeners) fn(unlocked);
    events.emit(AppEvents.AI_VAULT_CHANGED);
}

export function onLockChange(fn: (unlocked: boolean) => void): () => void {
    listeners.add(fn);
    return () => {
        listeners.delete(fn);
    };
}
