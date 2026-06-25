import { DB_NAMES, getClanDb, getDb } from "../core/database.js";

function pluckOneString(stmt: { get: (...args: never[]) => unknown }, ...args: unknown[]): string | null {
    return ((stmt.get as (...a: unknown[]) => unknown)(...args) as string | undefined) ?? null;
}

export function lookupRsnHash(clanId: string, accountHash: string): string | null {
    return pluckOneString(
        getClanDb(clanId).prepare("SELECT latest_rsn FROM clan_accounts WHERE account_hash = ?").pluck(),
        accountHash,
    );
}

export function rsnByHash(accountHash: string): string | null {
    return pluckOneString(
        getDb(DB_NAMES.APP)
            .prepare(
                `SELECT rsn FROM clansocket_account_rsns
             WHERE account_hash = ?
             ORDER BY last_seen DESC
             LIMIT 1`,
            )
            .pluck(),
        accountHash,
    );
}
