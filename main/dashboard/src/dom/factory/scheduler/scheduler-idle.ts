const IDLE_TIMEOUT_MS = 200;

interface IdleState {
    idleScheduled: boolean;
    idleOps: Array<() => void>;
    onFallback: () => void;
}

const state: IdleState = { idleScheduled: false, idleOps: [], onFallback: () => undefined };

export function initIdle(fallback: () => void): void {
    state.onFallback = fallback;
}

export function pushIdle(op: () => void): void {
    state.idleOps.push(op);
    ensureIdleScheduled();
}

export function drainIdleFallback(target: Array<() => void>): void {
    target.push(...state.idleOps.splice(0));
}

function onIdle(deadline: IdleDeadline): void {
    state.idleScheduled = false;
    while (state.idleOps.length > 0 && deadline.timeRemaining() > 0) {
        const op = state.idleOps.shift();
        if (op) op();
    }
    if (state.idleOps.length > 0) ensureIdleScheduled();
}

export function ensureIdleScheduled(): void {
    if (state.idleScheduled || state.idleOps.length === 0) return;
    if (typeof requestIdleCallback === "undefined") {
        state.onFallback();
        return;
    }
    state.idleScheduled = true;
    requestIdleCallback(onIdle, { timeout: IDLE_TIMEOUT_MS });
}
