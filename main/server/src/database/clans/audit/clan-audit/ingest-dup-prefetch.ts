import type Database from "better-sqlite3";
import type { ClientAuditEntry } from "./ingest.js";

export function prefetchDups(db: Database.Database, entries: readonly ClientAuditEntry[]): Set<string> {
    if (entries.length === 0) return new Set();
    const params: unknown[] = [];
    for (const e of entries) params.push(e.sessionId, e.seq);
    const placeholders = entries.map(() => "(?, ?)").join(",");
    const rows = db
        .prepare(`SELECT session_id, seq FROM clan_audit_log WHERE (session_id, seq) IN (VALUES ${placeholders})`)
        .all(...params) as { session_id: string; seq: number }[];
    const seen = new Set<string>();
    for (const r of rows) seen.add(`${r.session_id}|${r.seq}`);
    return seen;
}
