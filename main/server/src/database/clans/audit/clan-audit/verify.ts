import { clanAuditDb } from "../../../core/database.js";
import { hashRow } from "./chain.js";

export interface VerifyResult {
    ok: boolean;
    rowsChecked: number;
    breakAtId: number | null;
    breakReason: string | null;
}

interface AuditChainRow {
    id: number;
    ts: number;
    actor_site_account_id: string | null;
    action: string;
    source: string;
    schema_version: number;
    target_type: string | null;
    target_id: string | null;
    payload_json: string | null;
    prev_hash: string | null;
    row_hash: string;
}

function loadChainRows(clanId: string): AuditChainRow[] {
    return clanAuditDb(clanId)
        .prepare(
            `SELECT id, ts, actor_site_account_id, action, source, schema_version, target_type, target_id, payload_json, prev_hash, row_hash
             FROM clan_audit_log ORDER BY id ASC`,
        )
        .all() as AuditChainRow[];
}

function recomputeRowHash(r: AuditChainRow): string {
    return hashRow({
        ts: r.ts,
        actor: r.actor_site_account_id,
        action: r.action,
        source: r.source,
        schemaVersion: r.schema_version,
        targetType: r.target_type,
        targetId: r.target_id,
        payloadJson: r.payload_json,
        prevHash: r.prev_hash,
    });
}

export function verifyAuditChain(clanId: string): VerifyResult {
    const rows = loadChainRows(clanId);
    let expectedPrev: string | null = null;
    for (const r of rows) {
        if ((r.prev_hash ?? null) !== expectedPrev) {
            return { ok: false, rowsChecked: rows.length, breakAtId: r.id, breakReason: "prev_hash_mismatch" };
        }
        if (recomputeRowHash(r) !== r.row_hash) {
            return { ok: false, rowsChecked: rows.length, breakAtId: r.id, breakReason: "row_hash_mismatch" };
        }
        expectedPrev = r.row_hash;
    }
    return { ok: true, rowsChecked: rows.length, breakAtId: null, breakReason: null };
}
