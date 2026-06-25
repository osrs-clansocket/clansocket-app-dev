import type { Observer } from "./reactive-types.js";

export const currentObserverRef: { v: Observer | null } = { v: null };

export function track(subscribers: Set<Observer>): void {
    if (currentObserverRef.v === null) return;
    subscribers.add(currentObserverRef.v);
    currentObserverRef.v.deps.add(subscribers);
}
