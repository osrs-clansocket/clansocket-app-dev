import type Database from "better-sqlite3";
import type { ChangeEmitter } from "./change-inserter.js";
import { buildChangeEmitter } from "./change-inserter.js";
import type { EventEnvelopeCols } from "./envelope.js";
import type { HandlerCtx } from "./handler-ctx.js";
import {
    asNumber,
    asStringNullable,
    extractWhere,
    type PlayerIdentity,
    type SpatialColumns,
} from "./projection-utils.js";

function readPriorCount(conn: Database.Database, accountHash: string, tier: string): number | null {
    const row = conn
        .prepare("SELECT count FROM plugin_clues WHERE account_hash = ? AND tier = ?")
        .get(accountHash, tier) as { count: number } | undefined;
    return row?.count ?? null;
}

interface UpsertClueArgs {
    conn: Database.Database;
    id: PlayerIdentity;
    tier: string;
    count: number;
    now: number;
}

function upsertClue(args: UpsertClueArgs): void {
    const { conn, id, tier, count, now } = args;
    conn.prepare(
        `INSERT INTO plugin_clues (
            account_hash, rsn, tier,
            count, count_source, count_updated_at,
            first_seen, last_seen, updated_at
         ) VALUES ($accountHash, $rsn, $tier, $count, 'plugin', $now, $now, $now, $now)
         ON CONFLICT (account_hash, tier) DO UPDATE SET
            rsn = excluded.rsn,
            count = excluded.count,
            count_source = 'plugin',
            count_updated_at = excluded.count_updated_at,
            last_seen = excluded.last_seen,
            updated_at = CASE
                WHEN count != excluded.count
                THEN excluded.updated_at
                ELSE updated_at
            END`,
    ).run({ rsn: id.rsn ?? "", accountHash: id.accountHash, tier, count, now });
}

interface ClueChangeArgs {
    emitter: ChangeEmitter;
    id: PlayerIdentity;
    envelope: EventEnvelopeCols;
    where: SpatialColumns;
    tier: string;
    countBefore: number;
    countAfter: number;
}

function emitClueChange(args: ClueChangeArgs): void {
    const { emitter, id, envelope, where, tier, countBefore, countAfter } = args;
    emitter.emit({
        id,
        envelope,
        where,
        dedupKind: "clue_change",
        dedupParts: [tier, countBefore, countAfter],
        specific: [tier, countBefore, countAfter],
    });
}

const CLUE_CHANGE_COLS = ["tier", "count_before", "count_after"];

export function handleClueCompleted(ctx: HandlerCtx): void {
    const { conn, payload, now, envelope, id } = ctx;
    const tier = asStringNullable(payload.tier);
    if (tier === null) return;
    const countAfter = asNumber(payload.total, 0);
    const countBefore = asNumber(
        payload.cluesCompletedBefore,
        readPriorCount(conn, id.accountHash, tier) ?? Math.max(0, countAfter - 1),
    );
    const where = extractWhere(payload);
    const emitter = buildChangeEmitter(conn, "plugin_clues_changes", CLUE_CHANGE_COLS);
    conn.transaction(() => {
        emitClueChange({ emitter, id, envelope, where, tier, countBefore, countAfter });
        upsertClue({ conn, id, tier, now, count: countAfter });
    })();
}

export function handleClueOpened(ctx: HandlerCtx): void {
    const { conn, payload, envelope, id } = ctx;
    const tier = asStringNullable(payload.tier);
    if (tier === null) return;
    const current = readPriorCount(conn, id.accountHash, tier) ?? 0;
    const where = extractWhere(payload);
    const emitter = buildChangeEmitter(conn, "plugin_clues_changes", CLUE_CHANGE_COLS);
    emitClueChange({ emitter, id, envelope, where, tier, countBefore: current, countAfter: current });
}
