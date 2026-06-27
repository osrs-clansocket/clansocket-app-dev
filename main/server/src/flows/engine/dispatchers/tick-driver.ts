import logger from "@clansocket/logger";
import { DB_NAMES, getDb } from "../../../database/index.js";
import { loopTickDispatcher } from "./loop-tick-dispatcher.js";
import { scheduleTickDispatcher } from "./schedule-tick-dispatcher.js";

const MIN_TICK_INTERVAL_MS = 60_000;

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

async function tick(now: number): Promise<void> {
    const clanIds = listClanIds();
    for (const clanId of clanIds) {
        try {
            await loopTickDispatcher.sweep(clanId, now);
        } catch (err) {
            logger.warn(`tick-driver loop sweep failed for ${clanId}: ${(err as Error).message}`);
        }
        try {
            await scheduleTickDispatcher.sweep(clanId, now, (_cron, after) => after + 60_000);
        } catch (err) {
            logger.warn(`tick-driver schedule sweep failed for ${clanId}: ${(err as Error).message}`);
        }
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
