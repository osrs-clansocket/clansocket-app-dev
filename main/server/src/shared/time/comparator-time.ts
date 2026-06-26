import { MS_PER_HOUR } from "./time-constants.js";
import { toMs } from "./parser-time.js";

export function hoursBetween(aIso: string, bIso: string): number {
    return Math.abs(toMs(bIso) - toMs(aIso)) / MS_PER_HOUR;
}

export function msBetween(aIso: string, bIso: string): number {
    return Math.abs(toMs(bIso) - toMs(aIso));
}

export function hasElapsed(lastMs: number | null, intervalMs: number, nowMs: number = Date.now()): boolean {
    if (lastMs === null) return true;
    return nowMs - lastMs >= intervalMs;
}

export function elapsedRemaining(lastMs: number | null, intervalMs: number, nowMs: number = Date.now()): number {
    if (lastMs === null) return 0;
    const elapsed = nowMs - lastMs;
    if (elapsed >= intervalMs) return 0;
    return intervalMs - elapsed;
}
