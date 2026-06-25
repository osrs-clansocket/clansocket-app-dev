import type Database from "better-sqlite3";
import type { ChangeEmitter } from "./change-inserter.js";
import { buildChangeEmitter } from "./change-inserter.js";
import type { HandlerCtx } from "./handler-ctx.js";

import { asNumber, extractWhere, type PlayerIdentity, type SpatialColumns } from "./projection-utils.js";

interface BoostEntry {
    skill?: string;
    diff?: number;
}

function normalizeBoostSkill(raw: unknown): string | null {
    if (typeof raw !== "string") return null;
    const trimmed = raw.trim();
    return trimmed.length === 0 ? null : trimmed.toLowerCase();
}

function readPriorBoost(conn: Database.Database, accountHash: string, skill: string): number | null {
    const row = conn
        .prepare("SELECT diff FROM plugin_boosts WHERE account_hash = ? AND skill = ?")
        .get(accountHash, skill) as { diff: number } | undefined;
    return row?.diff ?? null;
}

interface UpsertBoostArgs {
    conn: Database.Database;
    id: PlayerIdentity;
    skill: string;
    diff: number;
    now: number;
}

function upsertBoost(args: UpsertBoostArgs): void {
    const { conn, id, skill, diff, now } = args;
    conn.prepare(
        `INSERT INTO plugin_boosts (account_hash, rsn, skill, diff, first_seen, last_seen, updated_at)
         VALUES ($accountHash, $rsn, $skill, $diff, $now, $now, $now)
         ON CONFLICT (account_hash, skill) DO UPDATE SET
            rsn = excluded.rsn,
            diff = excluded.diff,
            last_seen = excluded.last_seen,
            updated_at = CASE
                WHEN diff != excluded.diff
                THEN excluded.updated_at
                ELSE updated_at
            END`,
    ).run({ rsn: id.rsn ?? "", accountHash: id.accountHash, skill, diff, now });
}

interface BoostTransitionArgs {
    emitter: ChangeEmitter;
    ctx: HandlerCtx;
    where: SpatialColumns;
    skill: string;
    diffBefore: number;
    diffAfter: number;
}

function transitionBoost(args: BoostTransitionArgs): void {
    const { emitter, ctx, where, skill, diffBefore, diffAfter } = args;
    const { conn, id, now, envelope } = ctx;
    emitter.emit({
        id,
        envelope,
        where,
        dedupKind: "boost_change",
        dedupParts: [skill, diffBefore, diffAfter],
        specific: [skill, diffBefore, diffAfter],
    });
    upsertBoost({ conn, id, skill, now, diff: diffAfter });
}

interface BoostBatchArgs {
    emitter: ChangeEmitter;
    ctx: HandlerCtx;
    where: SpatialColumns;
    entries: BoostEntry[];
    seen: Set<string>;
}

function applyIncomingBoosts(args: BoostBatchArgs): void {
    const { emitter, ctx, where, entries, seen } = args;
    for (const entry of entries) {
        const skill = normalizeBoostSkill(entry.skill);
        if (skill === null) continue;
        seen.add(skill);
        const diffAfter = asNumber(entry.diff, 0);
        const diffBefore = readPriorBoost(ctx.conn, ctx.id.accountHash, skill) ?? 0;
        if (diffBefore !== diffAfter) transitionBoost({ emitter, ctx, where, skill, diffBefore, diffAfter });
    }
}

function clearStaleBoosts(emitter: ChangeEmitter, ctx: HandlerCtx, where: SpatialColumns, seen: Set<string>): void {
    const stale = ctx.conn
        .prepare("SELECT skill, diff FROM plugin_boosts WHERE account_hash = ? AND diff != 0")
        .all(ctx.id.accountHash) as { skill: string; diff: number }[];
    for (const row of stale) {
        if (!seen.has(row.skill))
            transitionBoost({ emitter, ctx, where, skill: row.skill, diffBefore: row.diff, diffAfter: 0 });
    }
}

export function handleBoosts(ctx: HandlerCtx): void {
    const { conn, payload } = ctx;
    const entries: BoostEntry[] = Array.isArray(payload.boosts) ? payload.boosts : [];
    const where = extractWhere(payload);
    const emitter = buildChangeEmitter(conn, "plugin_boosts_changes", ["skill", "diff_before", "diff_after"]);
    conn.transaction(() => {
        const seen = new Set<string>();
        applyIncomingBoosts({ emitter, ctx, where, entries, seen });
        clearStaleBoosts(emitter, ctx, where, seen);
    })();
}
