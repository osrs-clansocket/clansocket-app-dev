import logger from "@clansocket/logger";
import { clanAuditDb } from "../../../core/database.js";
import { auditContext } from "../../../../shared/audit-context.js";
import { lookupAction, validatePayload, type AnyAuditAction } from "../clan-audit-registry/index.js";
import { hashRow } from "./chain.js";
import { broadcastById } from "./list/index.js";
import { resolveAuditFields, type AuditFields, type EnrichedAudit, type InsertArgs } from "./audit-fields.js";

import type { RecordAuditArgs } from "./record-types.js";

export type { RecordAuditArgs } from "./record-types.js";

function enrichPayload<A extends AnyAuditAction>(entry: RecordAuditArgs<A>, now: number): EnrichedAudit {
    const ctx = auditContext.getStore();
    const elapsedMs = ctx ? now - ctx.startMs : null;
    const payload: Record<string, unknown> = { ...(entry.payload as Record<string, unknown>) };
    if (ctx?.causedBy) payload.causedBy = ctx.causedBy;
    if (ctx?.requestId) payload.requestId = ctx.requestId;
    if (elapsedMs !== null) payload.elapsedMs = elapsedMs;
    return { payload, elapsedMs, requestId: ctx?.requestId ?? null };
}

const AUDIT_INSERT_SQL = `INSERT INTO clan_audit_log
    (ts, actor_site_account_id, actor_kind, action, source, schema_version, target_type, target_id, target_name, guild_id, payload_json, request_id, elapsed_ms, prev_hash, row_hash)
 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

function auditHash<A extends AnyAuditAction>(a: InsertArgs<A>, f: AuditFields): string {
    return hashRow({
        ts: a.now,
        actor: a.entry.actor,
        action: a.entry.action,
        source: f.source,
        schemaVersion: f.schemaVersion,
        targetType: f.targetType,
        targetId: f.targetId,
        payloadJson: f.payloadJson,
        prevHash: f.prevHash,
    });
}

function buildInsertParams<A extends AnyAuditAction>(a: InsertArgs<A>, f: AuditFields, rowHash: string): unknown[] {
    return [
        a.now,
        a.entry.actor,
        a.entry.actorKind ?? "user",
        a.entry.action,
        f.source,
        f.schemaVersion,
        f.targetType,
        f.targetId,
        f.targetName,
        a.entry.guildId ?? null,
        f.payloadJson,
        a.enriched.requestId,
        a.enriched.elapsedMs,
        f.prevHash,
        rowHash,
    ];
}

function insertAuditRow<A extends AnyAuditAction>(a: InsertArgs<A>): number {
    let insertedId = -1;
    a.db.transaction(() => {
        const f = resolveAuditFields(a);
        const rowHash = auditHash(a, f);
        const result = a.db.prepare(AUDIT_INSERT_SQL).run(...buildInsertParams(a, f, rowHash));
        insertedId = Number(result.lastInsertRowid);
    })();
    return insertedId;
}

export function recordClanAudit<A extends AnyAuditAction>(clanId: string, entry: RecordAuditArgs<A>): void {
    const def = lookupAction(entry.action);
    if (!def) logger.warn(`[clansocket_audit] unknown action kind ${entry.action} — writing with defaults`);
    const now = Date.now();
    const enriched = enrichPayload(entry, now);
    if (def && !validatePayload(entry.action, enriched.payload)) {
        logger.warn(`[clansocket_audit] payload validation failed for ${entry.action}`);
    }
    const db = clanAuditDb(clanId);
    const insertedId = insertAuditRow({ db, clanId, entry, enriched, now });
    if (insertedId > 0) broadcastById(clanId, insertedId);
}
