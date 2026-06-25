import type Database from "better-sqlite3";
import { execMutation } from "../../core/db-mutations.js";
import type { HandlerCtx } from "./handler-ctx.js";
import type { Payload } from "./projection-utils.js";

const ENSURE_ROW_SQL = `INSERT INTO plugin_current_state (account_hash, latest_rsn, first_seen, last_seen, updated_at)
 VALUES ($accountHash, $rsn, $now, $now, $now)
 ON CONFLICT(account_hash) DO UPDATE SET last_seen = excluded.last_seen`;

const UPDATE_VITALS_SQL = `UPDATE plugin_current_state
    SET energy = $energy, weight = $weight, spec = $spec,
        hitpoints = $hitpoints, prayer = $prayer,
        max_hitpoints = $maxHitpoints, max_prayer = $maxPrayer,
        last_seen = $now, updated_at = $now
    WHERE account_hash = $accountHash`;

const UPDATE_INTERACTING_SQL = `UPDATE plugin_current_state
    SET interacting_kind = $kind, interacting_id = $id, interacting_name = $name,
        last_seen = $now, updated_at = $now
    WHERE account_hash = $accountHash`;

export function ensureRow(conn: Database.Database, accountHash: string, rsn: string | null, now: number): void {
    execMutation(conn, ENSURE_ROW_SQL, { rsn: rsn ?? "", accountHash, now });
}

export function handleVitals(ctx: HandlerCtx): void {
    const { conn, payload, now } = ctx;
    const { accountHash, rsn } = ctx.id;
    ensureRow(conn, accountHash, rsn, now);
    execMutation(conn, UPDATE_VITALS_SQL, {
        energy: typeof payload.energy === "number" ? payload.energy : null,
        weight: typeof payload.weight === "number" ? payload.weight : null,
        spec: typeof payload.spec === "number" ? payload.spec : null,
        hitpoints: typeof payload.hitpoints === "number" ? payload.hitpoints : null,
        prayer: typeof payload.prayer === "number" ? payload.prayer : null,
        maxHitpoints: typeof payload.maxHitpoints === "number" ? payload.maxHitpoints : null,
        maxPrayer: typeof payload.maxPrayer === "number" ? payload.maxPrayer : null,
        now,
        accountHash,
    });
}

function readTargetName(payload: Payload, kind: string | null): string | null {
    if (kind === "PLAYER") return null;
    return typeof payload.targetName === "string" ? payload.targetName : null;
}

export function handleInteracting(ctx: HandlerCtx): void {
    const { conn, payload, now } = ctx;
    const { accountHash, rsn } = ctx.id;
    ensureRow(conn, accountHash, rsn, now);
    const kind = typeof payload.targetKind === "string" ? payload.targetKind : null;
    const id = typeof payload.targetId === "number" ? payload.targetId : null;
    const name = readTargetName(payload, kind);
    execMutation(conn, UPDATE_INTERACTING_SQL, { kind, id, name, now, accountHash });
}
