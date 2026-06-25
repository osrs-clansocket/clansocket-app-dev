import { getDb } from "../../../../core/database.js";

export interface AccountBindings {
    hashesByAccount: Record<string, string[]>;
    allHashes: Set<string>;
}

export function loadAccountBindings(
    appDb: ReturnType<typeof getDb>,
    placeholders: string,
    ids: readonly string[],
): AccountBindings {
    const bindingRows = appDb
        .prepare(
            `SELECT site_account_id, account_hash
             FROM clansocket_account_bindings
             WHERE site_account_id IN (${placeholders}) AND revoked_at IS NULL`,
        )
        .all(...ids) as Array<{ site_account_id: string; account_hash: string }>;
    const hashesByAccount: Record<string, string[]> = {};
    const allHashes = new Set<string>();
    for (const row of bindingRows) {
        hashesByAccount[row.site_account_id] ??= [];
        hashesByAccount[row.site_account_id].push(row.account_hash);
        allHashes.add(row.account_hash);
    }
    return { hashesByAccount, allHashes };
}
