import { DB_NAMES } from "../../core/database.js";
import { selectOne } from "../../core/operations.js";
import { selectRows } from "../../../shared/loaders/db-rows.js";
import { CONSENT_COLUMNS, type ConsentKind, type ConsentRequestRow } from "./types.js";

function buildKindClause(kind: ConsentKind | undefined): { sql: string; args: unknown[] } {
    return kind ? { sql: " AND kind = ?", args: [kind] } : { sql: "", args: [] };
}

export function pendingByHash(accountHash: string, kind?: ConsentKind): ConsentRequestRow[] {
    const k = buildKindClause(kind);
    return selectRows<ConsentRequestRow>(
        DB_NAMES.APP,
        `SELECT ${CONSENT_COLUMNS}
         FROM clansocket_consent_requests
         WHERE target_account_hash = ?${k.sql} AND status = 'pending' AND expires_at > ?
         ORDER BY created_at ASC`,
        accountHash,
        ...k.args,
        Date.now(),
    );
}

export function pendingByRsn(rsn: string, kind?: ConsentKind): ConsentRequestRow[] {
    const k = buildKindClause(kind);
    return selectRows<ConsentRequestRow>(
        DB_NAMES.APP,
        `SELECT ${CONSENT_COLUMNS}
         FROM clansocket_consent_requests
         WHERE LOWER(target_rsn) = LOWER(?)${k.sql} AND status = 'pending' AND expires_at > ?
         ORDER BY created_at ASC`,
        rsn,
        ...k.args,
        Date.now(),
    );
}

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
