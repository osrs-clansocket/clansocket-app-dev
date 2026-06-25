import logger from "@clansocket/logger";

type WakeCallback = (clanId: string) => Promise<void>;

const TIMER_LOOKUP = new Map<string, NodeJS.Timeout>();
let onWakeCb: WakeCallback | null = null;

export function registerOnWake(cb: WakeCallback): void {
    onWakeCb = cb;
}

function clearScheduledWake(clanId: string): void {
    const existing = TIMER_LOOKUP.get(clanId);
    if (!existing) return;
    clearTimeout(existing);
    TIMER_LOOKUP.delete(clanId);
}

function fireProcessor(clanId: string): void {
    TIMER_LOOKUP.delete(clanId);
    if (!onWakeCb) return;
    onWakeCb(clanId).catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        logger.error(`[wom-dispatcher] processing clan ${clanId} threw: ${message}`);
    });
}

export function scheduleWake(clanId: string, dueAtMs: number): void {
    clearScheduledWake(clanId);
    const delayMs = Math.max(0, dueAtMs - Date.now());
    const timer = setTimeout(() => fireProcessor(clanId), delayMs);
    TIMER_LOOKUP.set(clanId, timer);
}

export function cancelScheduledWake(clanId: string): void {
    clearScheduledWake(clanId);
}
