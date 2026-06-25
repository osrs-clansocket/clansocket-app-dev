import { isPlainObject } from "../../../../../shared/validators/type-guards.js";
import type { AuditRow, ClanAuditEntry } from "./types.js";

function parsePayload(raw: string | null): Record<string, unknown> | null {
    if (raw === null || raw.length === 0) return null;
    try {
        const v = JSON.parse(raw);
        return isPlainObject(v) ? v : null;
    } catch {
        return null;
    }
}

export function rowToEntry(row: AuditRow): ClanAuditEntry {
    return {
        id: row.id,
        ts: row.ts,
        actorSiteAccountId: row.actor_site_account_id,
        actorKind: row.actor_kind === "ai" ? "ai" : "user",
        actorDisplay: null,
        action: row.action,
        source: row.source,
        schemaVersion: row.schema_version,
        targetType: row.target_type,
        targetId: row.target_id,
        payload: parsePayload(row.payload_json),
        requestId: row.request_id,
        elapsedMs: row.elapsed_ms,
    };
}
