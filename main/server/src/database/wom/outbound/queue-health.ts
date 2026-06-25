import { STATUS_PENDING, STATUS_IN_FLIGHT, STATUS_FAILED } from "../../../shared/constants/outbound-status.js";
import { clanWomRow } from "../db-runners.js";

export interface WomQueueStats {
    pending: number;
    inFlight: number;
    failed: number;
    nextDueAt: number | null;
}

interface CountRow {
    n: number;
}

interface NextRow {
    next_due: number | null;
}

function countWhere(clanId: string, sql: string, ...params: unknown[]): number {
    const row = clanWomRow<CountRow>(clanId, sql, ...params);
    return row?.n ?? 0;
}

const COUNT_BY_STATUS_SQL = `SELECT COUNT(*) AS n FROM clan_wom_outbound_events WHERE status = ?`;
const NEXT_DUE_SQL = `SELECT MIN(COALESCE(next_attempt_at, scheduled_at)) AS next_due
         FROM clan_wom_outbound_events
         WHERE status = ?`;

export function womQueueStats(clanId: string): WomQueueStats {
    const pending = countWhere(clanId, COUNT_BY_STATUS_SQL, STATUS_PENDING);
    const inFlight = countWhere(clanId, COUNT_BY_STATUS_SQL, STATUS_IN_FLIGHT);
    const failed = countWhere(clanId, COUNT_BY_STATUS_SQL, STATUS_FAILED);
    const nextRow = clanWomRow<NextRow>(clanId, NEXT_DUE_SQL, STATUS_PENDING);
    return { pending, inFlight, failed, nextDueAt: nextRow?.next_due ?? null };
}
