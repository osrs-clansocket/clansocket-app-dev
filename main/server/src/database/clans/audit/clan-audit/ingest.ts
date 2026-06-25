import type Database from "better-sqlite3";
import logger from "@clansocket/logger";
import { clanAuditDb } from "../../../core/database.js";
import { auditContext } from "../../../../shared/audit-context.js";
import { getLastHash, hashRow } from "./chain.js";
import { type ActorKind, broadcastById } from "./list/index.js";
import { prefetchDups } from "./ingest-dup-prefetch.js";

export interface ClientAuditEntry {
    sessionId: string;
    seq: number;
    ts: number;
    action: string;
    target?: string | null;
    meta?: Record<string, unknown> | null;
    actor_kind?: ActorKind;
}

export interface IngestResult {
    accepted: number;
    ignored: number;
}

interface InsertEntryArgs {
    db: Database.Database;
    insertStmt: Database.Statement;
    entry: ClientAuditEntry;
    actorSiteAccountId: string;
    ctx: ReturnType<typeof auditContext.getStore>;
}

function computeAuditHash(
    e: ClientAuditEntry,
    actorSiteAccountId: string,
    payloadJson: string | null,
    prevHash: string | null,
): string {
    return hashRow({
        ts: e.ts,
        actor: actorSiteAccountId,
        action: e.action,
        source: "client",
        schemaVersion: 1,
        targetType: null,
        targetId: e.target ?? null,
        payloadJson,
        prevHash,
    });
}

function insertAuditEntry(args: InsertEntryArgs): number {
    const { db, insertStmt, entry: e, actorSiteAccountId, ctx } = args;
    const payloadJson = e.meta ? JSON.stringify(e.meta) : null;
    const prevHash = getLastHash(db);
    const rowHash = computeAuditHash(e, actorSiteAccountId, payloadJson, prevHash);
    const result = insertStmt.run(
        e.ts,
        actorSiteAccountId,
        e.actor_kind ?? "user",
        e.action,
        e.target ?? null,
        payloadJson,
        e.sessionId,
        e.seq,
        ctx?.requestId ?? null,
        ctx ? Date.now() - ctx.startMs : null,
        prevHash,
        rowHash,
    );
    return Number(result.lastInsertRowid);
}

interface BatchArgs {
    db: Database.Database;
    insertStmt: Database.Statement;
    actorSiteAccountId: string;
    ctx: ReturnType<typeof auditContext.getStore>;
    existingDups: Set<string>;
    entries: readonly ClientAuditEntry[];
    clanId: string;
}

interface BatchResult {
    accepted: number;
    ignored: number;
    insertedIds: number[];
}

function runBatchTx(a: BatchArgs): BatchResult {
    let accepted = 0;
    let ignored = 0;
    const insertedIds: number[] = [];
    a.db.transaction((es: readonly ClientAuditEntry[]) => {
        logger.debug(`[audit-ingest] tx clanId=${a.clanId} entries=${es.length}`);
        for (const e of es) {
            if (a.existingDups.has(`${e.sessionId}|${e.seq}`)) {
                ignored += 1;
                continue;
            }
            const id = insertAuditEntry({
                db: a.db,
                insertStmt: a.insertStmt,
                entry: e,
                actorSiteAccountId: a.actorSiteAccountId,
                ctx: a.ctx,
            });
            insertedIds.push(id);
            accepted += 1;
        }
    })(a.entries);
    return { accepted, ignored, insertedIds };
}

const INGEST_INSERT_SQL = `INSERT INTO clan_audit_log
    (ts, actor_site_account_id, actor_kind, action, source, schema_version, target_type, target_id, payload_json, session_id, seq, request_id, elapsed_ms, prev_hash, row_hash)
 VALUES (?, ?, ?, ?, 'client', 1, NULL, ?, ?, ?, ?, ?, ?, ?, ?)`;

export function ingestAuditBatch(
    clanId: string,
    actorSiteAccountId: string,
    entries: readonly ClientAuditEntry[],
): IngestResult {
    if (entries.length === 0) return { accepted: 0, ignored: 0 };
    const ctx = auditContext.getStore();
    const db = clanAuditDb(clanId);
    const insertStmt = db.prepare(INGEST_INSERT_SQL);
    const existingDups = prefetchDups(db, entries);
    const { accepted, ignored, insertedIds } = runBatchTx({
        db,
        insertStmt,
        actorSiteAccountId,
        ctx,
        existingDups,
        entries,
        clanId,
    });
    for (const id of insertedIds) broadcastById(clanId, id);
    return { accepted, ignored };
}
