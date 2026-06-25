import { DB_NAMES, getDb } from "../../database/index.js";
import { sha256Hex } from "../../shared/hash.js";

function hashCode(code: string): string {
    return sha256Hex(code.replaceAll("-", "").toUpperCase());
}

export function redeemBackupCode(code: string): { siteAccountId: string } | null {
    const hash = hashCode(code);
    const db = getDb(DB_NAMES.APP);
    return db.transaction((): { siteAccountId: string } | null => {
        const row = db
            .prepare(`SELECT id, site_account_id, redeemed_at FROM clansocket_backup_codes WHERE code_hash = ?`)
            .get(hash) as { id: number; site_account_id: string; redeemed_at: number | null } | undefined;
        if (!row) return null;
        if (row.redeemed_at !== null) return null;
        db.prepare(`UPDATE clansocket_backup_codes SET redeemed_at = ? WHERE id = ?`).run(Date.now(), row.id);
        return { siteAccountId: row.site_account_id };
    })();
}
