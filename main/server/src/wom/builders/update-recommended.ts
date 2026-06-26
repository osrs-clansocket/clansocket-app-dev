import { hasElapsed, MS_PER_HOUR } from "../../shared/time/index.js";

const RECOMMENDED_PLAYER_UPDATE_INTERVAL_MS = 6 * MS_PER_HOUR;

export function isUpdateRecommended(lastUpdateAtMs: number | null, nowMs: number = Date.now()): boolean {
    return hasElapsed(lastUpdateAtMs, RECOMMENDED_PLAYER_UPDATE_INTERVAL_MS, nowMs);
}
