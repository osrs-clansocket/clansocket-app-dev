import logger from "@clansocket/logger";
import { womRateWindow } from "../../database/wom/rate-window/get.js";
import { rollWindow } from "../../database/wom/rate-window/updater-rate.js";
import { scheduleWake } from "./wake-scheduler.js";

const WINDOW_MS = 60000;

export interface RateOutcome {
    proceed: boolean;
    windowCount: number;
    consecutive429: number;
}

export function checkRateWindow(clanId: string, rateLimit: number, now: number): RateOutcome {
    const initial = womRateWindow(clanId, rateLimit);
    rollWindow(clanId, initial.window_start);
    const win = womRateWindow(clanId, rateLimit);
    const outcome = { windowCount: win.window_count, consecutive429: win.consecutive_429 };
    if (win.state_name === "banned") {
        logger.warn(`[wom-dispatcher] clan ${clanId} in banned state; deferring`);
        scheduleWake(clanId, now + WINDOW_MS);
        return { proceed: false, ...outcome };
    }
    const spacingMs = WINDOW_MS / rateLimit;
    if (now - win.last_request_at < spacingMs) {
        scheduleWake(clanId, win.last_request_at + spacingMs);
        return { proceed: false, ...outcome };
    }
    if (win.window_count >= rateLimit) {
        scheduleWake(clanId, win.window_start + WINDOW_MS);
        return { proceed: false, ...outcome };
    }
    return { proceed: true, ...outcome };
}
