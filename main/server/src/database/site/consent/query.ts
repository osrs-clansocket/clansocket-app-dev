import { DB_NAMES } from "../../core/database.js";
import { selectOne } from "../../core/operations/index.js";
import { selectRows } from "../../../shared/loaders/db-rows.js";
import { CONSENT_COLUMNS, type ConsentKind, type ConsentRequestRow } from "./types.js";

function buildKindClause(kind: ConsentKind | undefined): { sql: string; args: unknown[] } {
    return kind ? { sql: " AND kind = ?", args: [kind] } : { sql: "", args: [] };
}

function pendingClause(whereExpr: string, value: string, kind?: ConsentKind): ConsentRequestRow[] {
    const k = buildKindClause(kind);
    return selectRows<ConsentRequestRow>(
        DB_NAMES.APP,
        `SELECT ${CONSENT_COLUMNS}
         FROM clansocket_consent_requests
         WHERE ${whereExpr}${k.sql} AND status = 'pending' AND expires_at > ?
         ORDER BY created_at ASC`,
        value,
        ...k.args,
        Date.now(),
    );
}

export const pendingByHash = (accountHash: string, kind?: ConsentKind): ConsentRequestRow[] =>
    pendingClause("target_account_hash = ?", accountHash, kind);

export const pendingByRsn = (rsn: string, kind?: ConsentKind): ConsentRequestRow[] =>
    pendingClause("LOWER(target_rsn) = LOWER(?)", rsn, kind);

export function pendingByAccount(siteAccountId: string, kind?: ConsentKind): ConsentRequestRow[] {
    const k = buildKindClause(kind);
    return selectRows<ConsentRequestRow>(
        DB_NAMES.APP,
        `SELECT ${CONSENT_COLUMNS}
         FROM clansocket_consent_requests
         WHERE requesting_site_account_id = ?${k.sql} AND status = 'pending'
         ORDER BY created_at DESC`,
        siteAccountId,
        ...k.args,
    );
}

export function allByAccount(siteAccountId: string): ConsentRequestRow[] {
    return selectRows<ConsentRequestRow>(
        DB_NAMES.APP,
        `SELECT ${CONSENT_COLUMNS}
         FROM clansocket_consent_requests
         WHERE requesting_site_account_id = ?
         ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END, created_at DESC`,
        siteAccountId,
    );
}

export function consentById(id: number): ConsentRequestRow | null {
    return selectOne<ConsentRequestRow>(
        DB_NAMES.APP,
        `SELECT ${CONSENT_COLUMNS} FROM clansocket_consent_requests WHERE id = ?`,
        id,
    );
}

export function consentRequestedBy(
    record: ConsentRequestRow | null,
    siteAccountId: string,
): record is ConsentRequestRow {
    return record !== null && record.requesting_site_account_id === siteAccountId;
}
