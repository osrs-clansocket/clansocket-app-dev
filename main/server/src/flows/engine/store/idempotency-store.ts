import { createHash } from "node:crypto";
import { clanFlowsDb } from "../../../database/index.js";

const DEFAULT_RETENTION_MS = 5 * 60_000;
const SQLITE_CONSTRAINT_UNIQUE_CODE = "SQLITE_CONSTRAINT_PRIMARYKEY";

const INSERT_SQL = `INSERT INTO clan_flow_idempotency (key, flow_id, trigger_id, fired_at, retention_until)
    VALUES (?, ?, ?, ?, ?)`;

const PRUNE_SQL = `DELETE FROM clan_flow_idempotency WHERE retention_until < ?`;

let lastPruneAt = 0;
const PRUNE_INTERVAL_MS = 5 * 60_000;

function hashPayload(payload: Readonly<Record<string, unknown>>): string {
    const serialized = JSON.stringify(payload, Object.keys(payload).sort());
    return createHash("sha256").update(serialized).digest("hex").slice(0, 16);
}

function bucketKey(triggerId: string, payload: Readonly<Record<string, unknown>>, now: number): string {
    const secondBucket = Math.floor(now / 1_000);
    return `event:${triggerId}:${hashPayload(payload)}:${secondBucket}`;
}

function maybePrune(clanId: string, now: number): void {
    if (now - lastPruneAt < PRUNE_INTERVAL_MS) return;
    lastPruneAt = now;
    try {
        clanFlowsDb(clanId).prepare(PRUNE_SQL).run(now);
    } catch {
    }
}

export function pruneExpiredIdempotency(clanId: string, now: number): void {
    clanFlowsDb(clanId).prepare(PRUNE_SQL).run(now);
}

export function claimEventIdempotency(
    clanId: string,
    triggerId: string,
    payload: Readonly<Record<string, unknown>>,
    flowId: string,
): boolean {
    const now = Date.now();
    const key = `${flowId}:${bucketKey(triggerId, payload, now)}`;
    try {
        clanFlowsDb(clanId).prepare(INSERT_SQL).run(key, flowId, triggerId, now, now + DEFAULT_RETENTION_MS);
        maybePrune(clanId, now);
        return true;
    } catch (err) {
        const code = (err as { code?: string } | null)?.code;
        if (code === SQLITE_CONSTRAINT_UNIQUE_CODE || code === "SQLITE_CONSTRAINT") return false;
        throw err;
    }
}

export function claimCustomIdempotency(clanId: string, key: string, retentionMs: number): boolean {
    const now = Date.now();
    try {
        clanFlowsDb(clanId).prepare(INSERT_SQL).run(key, null, null, now, now + retentionMs);
        return true;
    } catch (err) {
        const code = (err as { code?: string } | null)?.code;
        if (code === SQLITE_CONSTRAINT_UNIQUE_CODE || code === "SQLITE_CONSTRAINT") return false;
        throw err;
    }
}
