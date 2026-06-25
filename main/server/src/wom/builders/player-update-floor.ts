import { hasElapsed, msUntilNext, MS_PER_HOUR } from "../../shared/time.js";

export { isUpdateRecommended } from "./update-recommended.js";

const MIN_PLAYER_UPDATE_INTERVAL_MS = MS_PER_HOUR;

export function isUpdateAllowed(lastUpdateAtMs: number | null, nowMs: number = Date.now()): boolean {
    return hasElapsed(lastUpdateAtMs, MIN_PLAYER_UPDATE_INTERVAL_MS, nowMs);
}

export function msUntilAllowed(lastUpdateAtMs: number | null, nowMs: number = Date.now()): number {
    return msUntilNext(lastUpdateAtMs, MIN_PLAYER_UPDATE_INTERVAL_MS, nowMs);
}
