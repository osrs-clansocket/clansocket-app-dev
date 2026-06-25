import type { Observer } from "./reactive-types.js";
import { currentObserverRef } from "./reactive-track.js";

export function freshObserver(isMemo: boolean): Observer {
    return {
        isMemo,
        deps: new Set(),
        dirty: isMemo,
        active: true,
        memoSubs: isMemo ? new Set() : null,
        run: () => undefined,
    };
}

export function rebindThen(o: Observer, fn: () => void): void {
    for (const dep of o.deps) dep.delete(o);
    o.deps.clear();
    const prev = currentObserverRef.v;
    currentObserverRef.v = o;
    try {
        fn();
    } finally {
        currentObserverRef.v = prev;
    }
}

export function disposeObserver(o: Observer): void {
    o.active = false;
    for (const dep of o.deps) dep.delete(o);
    o.deps.clear();
}
