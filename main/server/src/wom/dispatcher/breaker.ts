import logger from "@clansocket/logger";

const FAILURE_WINDOW_MS = 60000;
const FAILURE_THRESHOLD = 3;
const COOLDOWN_MS = 300000;
const MAX_BREAKER_ENTRIES = 64;

interface BreakerState {
    consecutiveFailures: number;
    firstFailureAt: number;
    openUntil: number;
}

const breakerByClan = new Map<string, BreakerState>();

function breakerEvictIdle(): void {
    const overflow = breakerByClan.size - MAX_BREAKER_ENTRIES;
    if (overflow <= 0) return;
    let removed = 0;
    for (const [id, state] of breakerByClan) {
        if (removed >= overflow) return;
        if (state.openUntil === 0 && state.consecutiveFailures === 0) {
            breakerByClan.delete(id);
            removed += 1;
        }
    }
}

function breakerFor(clanId: string): BreakerState {
    const existing = breakerByClan.get(clanId);
    if (existing) return existing;
    breakerEvictIdle();
    const fresh: BreakerState = { consecutiveFailures: 0, firstFailureAt: 0, openUntil: 0 };
    breakerByClan.set(clanId, fresh);
    return fresh;
}

export function breakerNoteFail(clanId: string): void {
    const state = breakerFor(clanId);
    const now = Date.now();
    if (now - state.firstFailureAt > FAILURE_WINDOW_MS) {
        state.consecutiveFailures = 1;
        state.firstFailureAt = now;
    } else {
        state.consecutiveFailures += 1;
    }
    if (state.consecutiveFailures >= FAILURE_THRESHOLD && state.openUntil <= now) {
        state.openUntil = now + COOLDOWN_MS;
        logger.warn(
            `[wom-breaker] opened clan=${clanId} until=${state.openUntil} (consecutive5xx=${state.consecutiveFailures})`,
        );
    }
}

export function breakerNoteOk(clanId: string): void {
    const state = breakerByClan.get(clanId);
    if (!state) return;
    if (state.openUntil > 0) logger.info(`[wom-breaker] closed clan=${clanId} (success after outage)`);
    state.consecutiveFailures = 0;
    state.firstFailureAt = 0;
    state.openUntil = 0;
}

export function breakerOpenUntil(clanId: string): number | null {
    const state = breakerByClan.get(clanId);
    if (!state || state.openUntil === 0) return null;
    const now = Date.now();
    if (state.openUntil <= now) {
        state.openUntil = 0;
        return null;
    }
    return state.openUntil;
}
