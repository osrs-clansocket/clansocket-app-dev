import { clanWomRow, runWomWrite } from "../db-runners.js";

export type WindowStateName = "within_limit" | "near_limit" | "at_limit" | "banned";

export interface RateWindowRow {
    singleton_key: string;
    window_start: number;
    window_count: number;
    consecutive_429: number;
    last_request_at: number;
    rate_limit: number;
    state_name: WindowStateName;
    updated_at: number;
}

const SELECT_SQL = `SELECT singleton_key, window_start, window_count, consecutive_429,
                           last_request_at, rate_limit, state_name, updated_at
                    FROM clan_wom_rate_window WHERE singleton_key = 'default'`;

const INIT_SQL = `INSERT OR IGNORE INTO clan_wom_rate_window
    (singleton_key, window_start, window_count, consecutive_429,
     last_request_at, rate_limit, state_name, updated_at)
    VALUES ('default', ?, 0, 0, 0, ?, 'within_limit', ?)`;

function ensureRow(clanId: string, rateLimit: number): void {
    const now = Date.now();
    runWomWrite(clanId, INIT_SQL, now, rateLimit, now);
}

export function womRateWindow(clanId: string, rateLimit: number): RateWindowRow {
    let row = clanWomRow<RateWindowRow>(clanId, SELECT_SQL);
    if (!row) {
        ensureRow(clanId, rateLimit);
        row = clanWomRow<RateWindowRow>(clanId, SELECT_SQL);
    }
    if (!row) {
        throw new Error(`failed to initialize clan_wom_rate_window for clan ${clanId}`);
    }
    return row;
}
