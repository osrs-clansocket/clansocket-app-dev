import type { Observer } from "./reactive-types.js";

const effectQueue: Observer[] = [];
let flushScheduled = false;

export function markDownstream(subscribers: Set<Observer>): void {
    for (const o of [...subscribers]) {
        if (o.dirty) continue;
        o.dirty = true;
        if (o.isMemo && o.memoSubs !== null) markDownstream(o.memoSubs);
        else effectQueue.push(o);
    }
}

function drainEffects(): void {
    flushScheduled = false;
    while (effectQueue.length > 0) {
        const batch = effectQueue.splice(0);
        for (const o of batch) {
            if (!o.dirty || !o.active) continue;
            o.dirty = false;
            o.run();
        }
    }
}

export function scheduleFlush(): void {
    if (flushScheduled) return;
    flushScheduled = true;
    queueMicrotask(drainEffects);
}
