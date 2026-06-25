import { DB_NAMES, getDb } from "../../core/database.js";
import { getOne } from "../../core/db-ops.js";

export interface PrimaryBinding {
    account_hash: string;
    rsn: string | null;
}

export interface InstallerIdentity {
    accountHash: string | null;
    rsn: string | null;
}

export function primaryBinding(siteAccountId: string): PrimaryBinding | null {
    return getOne<PrimaryBinding>(
        getDb(DB_NAMES.APP),
        `SELECT account_hash, rsn FROM clansocket_account_bindings
         WHERE site_account_id = ? AND revoked_at IS NULL
         ORDER BY last_seen_at DESC LIMIT 1`,
        siteAccountId,
    );
}

export function resolveInstallerIdentity(siteAccountId: string | null): InstallerIdentity {
    if (!siteAccountId) return { accountHash: null, rsn: null };
    const binding = primaryBinding(siteAccountId);
    return { accountHash: binding?.account_hash ?? null, rsn: binding?.rsn ?? null };
}
