import { runWomWrite } from "../db-runners.js";
import type { WindowStateName } from "./get.js";

export { recordWom429, recordWomSuccess, clearWomBan } from "./ban-tracking.js";

const WINDOW_MS = 60000;
const NEAR_LIMIT_FRACTION = 0.8;

export function rollWindow(clanId: string, windowStart: number): boolean {
    const now = Date.now();
    if (now - windowStart < WINDOW_MS) return false;
    runWomWrite(
        clanId,
        `UPDATE clan_wom_rate_window
         SET window_start = ?, window_count = 0, state_name = 'within_limit'
         WHERE singleton_key = 'default'`,
        now,
    );
    return true;
}

export function recordSent(clanId: string, current_count: number, rate_limit: number): void {
    const newCount = current_count + 1;
    let stateName: WindowStateName = "within_limit";
    if (newCount >= rate_limit) stateName = "at_limit";
    else if (newCount >= NEAR_LIMIT_FRACTION * rate_limit) stateName = "near_limit";
    runWomWrite(
        clanId,
        `UPDATE clan_wom_rate_window
         SET window_count = ?, last_request_at = ?, state_name = ?
         WHERE singleton_key = 'default'`,
        newCount,
        Date.now(),
        stateName,
    );
}
