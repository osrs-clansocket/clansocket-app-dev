import logger from "@clansocket/logger";
import { DB_NAMES, getDb } from "../../../database/index.js";
import { loopTickDispatcher } from "./loop-tick-dispatcher.js";
import { scheduleTickDispatcher } from "./schedule-tick-dispatcher.js";
import { listWaitingByWakeTime, claimWaitingByTime } from "../store/execution-store.js";
import { stepDispatcher } from "./step-dispatcher.js";
import { nextFireAt } from "./cron-evaluator.js";
import { claimCustomIdempotency, pruneExpiredIdempotency } from "../store/idempotency-store.js";

const MIN_TICK_INTERVAL_MS = 60_000;
const TICK_LOCK_RETENTION_MS = 90_000;

let lastTickAt = 0;
let inFlight = false;

interface ClanIdRow {
    id: string;
}

function listClanIds(): readonly string[] {
    try {
        const rows = getDb(DB_NAMES.APP)
            .prepare("SELECT id FROM clansocket_clans WHERE archived_at IS NULL")
            .all() as ClanIdRow[];
        return rows.map((r) => r.id);
    } catch (err) {
        logger.warn(`tick-driver: clan list failed: ${(err as Error).message}`);
        return [];
    }
}

async function resumeWaitingExecutions(clanId: string, now: number): Promise<void> {
    const waiting = listWaitingByWakeTime(clanId, now);
    for (const wait of waiting) {
        if (!claimWaitingByTime(clanId, wait.executionId, now)) continue;
        wait.ctx.status = "RUNNING";
        wait.ctx.wakeAt = null;
        wait.ctx.wakeEventKind = null;
        wait.ctx.wakeTimeoutAt = null;
        try {
            await stepDispatcher.advance(wait.ctx);
        } catch (err) {
            logger.warn(`tick-driver resume failed for execution ${wait.executionId}: ${(err as Error).message}`);
        }
    }
}

function minuteBucket(ms: number): number {
    return Math.floor(ms / 60_000);
}

async function sweepClan(clanId: string, now: number): Promise<void> {
    const lockKey = `tick:${clanId}:${minuteBucket(now)}`;
    if (!claimCustomIdempotency(clanId, lockKey, TICK_LOCK_RETENTION_MS)) return;
    try {
        await loopTickDispatcher.sweep(clanId, now);
    } catch (err) {
        logger.warn(`tick-driver loop sweep failed for ${clanId}: ${(err as Error).message}`);
    }
    try {
        await scheduleTickDispatcher.sweep(clanId, now, (cron, after, timezone) => {
            try {
                return nextFireAt(cron, after, timezone);
            } catch (err) {
                logger.warn(`tick-driver cron parse failed for "${cron}": ${(err as Error).message}`);
                return after + 60_000;
            }
        });
    } catch (err) {
        logger.warn(`tick-driver schedule sweep failed for ${clanId}: ${(err as Error).message}`);
    }
    await resumeWaitingExecutions(clanId, now);
    try {
        pruneExpiredIdempotency(clanId, now);
    } catch {}
}

async function tick(now: number): Promise<void> {
    const clanIds = listClanIds();
    for (const clanId of clanIds) {
        await sweepClan(clanId, now);
    }
}

export function maybeTick(now: number): void {
    if (inFlight) return;
    if (now - lastTickAt < MIN_TICK_INTERVAL_MS) return;
    lastTickAt = now;
    inFlight = true;
    void tick(now)
        .catch((err) => {
            logger.warn(`tick-driver top-level failure: ${(err as Error).message}`);
        })
        .finally(() => {
            inFlight = false;
        });
}
