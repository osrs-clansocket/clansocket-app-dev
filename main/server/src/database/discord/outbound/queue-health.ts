import { STATUS_PENDING, STATUS_IN_FLIGHT, STATUS_FAILED } from "../../../shared/constants/outbound-status.js";
import logger from "@clansocket/logger";
import { DB_NAMES } from "../../core/db-constants.js";
import { getDb } from "../../core/database.js";

const READY_BACKLOG_WARN_THRESHOLD = 10;
const OLDEST_PENDING_WARN_MS = 60_000;
const STALE_IN_FLIGHT_MS = 300_000;

export interface OutboundQueueStats {
    readyToAttempt: number;
    waitingForRetry: number;
    inFlight: number;
    deadLetter: number;
    oldestReadyMs: number | null;
}

function countWhere(sql: string, ...params: unknown[]): number {
    const db = getDb(DB_NAMES.DISCORD_BOT);
    const row = db.prepare(sql).get(...params) as { n: number } | undefined;
    return row?.n ?? 0;
}

export function outboundQueueStats(): OutboundQueueStats {
    const now = Date.now();
    const earliestRow = getDb(DB_NAMES.DISCORD_BOT)
        .prepare(
            `SELECT MIN(scheduled_at) AS earliest FROM discord_outbound_events
         WHERE status = ? AND (next_attempt_at IS NULL OR next_attempt_at <= ?)`,
        )
        .get(STATUS_PENDING, now) as { earliest: number | null } | undefined;
    return {
        readyToAttempt: countWhere(
            `SELECT COUNT(*) AS n FROM discord_outbound_events WHERE status = ? AND (next_attempt_at IS NULL OR next_attempt_at <= ?)`,
            STATUS_PENDING,
            now,
        ),
        waitingForRetry: countWhere(
            `SELECT COUNT(*) AS n FROM discord_outbound_events WHERE status = ? AND next_attempt_at > ?`,
            STATUS_PENDING,
            now,
        ),
        inFlight: countWhere(`SELECT COUNT(*) AS n FROM discord_outbound_events WHERE status = ?`, STATUS_IN_FLIGHT),
        deadLetter: countWhere(`SELECT COUNT(*) AS n FROM discord_outbound_events WHERE status = ?`, STATUS_FAILED),
        oldestReadyMs: earliestRow?.earliest ? now - earliestRow.earliest : null,
    };
}

export function resetStaleFlight(): number {
    const cutoff = Date.now() - STALE_IN_FLIGHT_MS;
    const result = getDb(DB_NAMES.DISCORD_BOT)
        .prepare(`UPDATE discord_outbound_events SET status = ? WHERE status = ? AND updated_at < ?`)
        .run(STATUS_PENDING, STATUS_IN_FLIGHT, cutoff);
    return result.changes;
}

export function warnQueueBacklog(): void {
    const stats = outboundQueueStats();
    const oldestMs = stats.oldestReadyMs ?? 0;
    if (stats.readyToAttempt < READY_BACKLOG_WARN_THRESHOLD && oldestMs < OLDEST_PENDING_WARN_MS) return;
    logger.warn(
        `[discord] outbound queue backlog: ready=${stats.readyToAttempt} waiting=${stats.waitingForRetry} inFlight=${stats.inFlight} deadLetter=${stats.deadLetter} oldestReadyMs=${oldestMs}`,
    );
}
