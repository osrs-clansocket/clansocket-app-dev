import { getDb, DB_NAMES, getClanDb } from "../../core/database.js";
import { sqlPlaceholders } from "../../core/operations/index.js";
import { hashesForAccount } from "../../site/site-accounts/index.js";

export type ClanPosture = "owner" | "manager" | "member";

interface ManagerRoleRow {
    role: "owner" | "manager";
}

function activeManagerRole(siteAccountId: string, clanId: string): "owner" | "manager" | null {
    const row = getDb(DB_NAMES.APP)
        .prepare(
            `SELECT role FROM clansocket_clan_managers
             WHERE site_account_id = ? AND clan_id = ? AND revoked_at IS NULL
             LIMIT 1`,
        )
        .get(siteAccountId, clanId) as ManagerRoleRow | undefined;
    return row?.role ?? null;
}

function hasHashRow(clanId: string, table: string, hashes: readonly string[]): boolean {
    if (hashes.length === 0) return false;
    const row = getClanDb(clanId)
        .prepare(`SELECT 1 FROM ${table} WHERE account_hash IN (${sqlPlaceholders(hashes.length)}) LIMIT 1`)
        .get(...hashes);
    return Boolean(row);
}

function hasAccountsRow(clanId: string, hashes: readonly string[]): boolean {
    return hasHashRow(clanId, "clan_accounts", hashes);
}

function hasRosterRow(clanId: string, hashes: readonly string[]): boolean {
    return hasHashRow(clanId, "clan_members", hashes);
}

type PresenceCheck = (clanId: string, hashes: readonly string[]) => boolean;

function resolvePostureWith(siteAccountId: string, clanId: string, check: PresenceCheck): ClanPosture | null {
    const role = activeManagerRole(siteAccountId, clanId);
    if (role !== null) return role;
    const hashes = hashesForAccount(siteAccountId);
    if (check(clanId, hashes)) return "member";
    return null;
}

export function resolveClanPosture(siteAccountId: string, clanId: string): ClanPosture | null {
    return resolvePostureWith(siteAccountId, clanId, hasAccountsRow);
}

export function resolveLivePosture(siteAccountId: string, clanId: string): ClanPosture | null {
    return resolvePostureWith(siteAccountId, clanId, hasRosterRow);
}
