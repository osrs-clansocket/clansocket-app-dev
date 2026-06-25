import { DB_NAMES, getDb } from "../../core/database.js";

export interface AccountBinding {
    account_hash: string;
    site_account_id: string;
}

const SELECT_SQL = `SELECT DISTINCT r.account_hash AS account_hash, b.site_account_id AS site_account_id
                    FROM clansocket_account_rsns r
                    JOIN clansocket_account_bindings b ON b.account_hash = r.account_hash
                    WHERE LOWER(r.rsn) = ?
                      AND b.revoked_at IS NULL`;

export function findAccountsRsn(rsnNormalized: string): AccountBinding[] {
    return getDb(DB_NAMES.APP).prepare(SELECT_SQL).all(rsnNormalized) as AccountBinding[];
}
