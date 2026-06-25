import type Database from "better-sqlite3";
import type { PluginIdentityRecord } from "./types.js";

function updateClanAccount(clanDb: Database.Database, identity: PluginIdentityRecord, now: number): void {
    const accountType = identity.accountType ?? null;
    clanDb
        .prepare(
            `UPDATE clan_accounts SET
                latest_rsn = ?,
                account_type = COALESCE(?, account_type),
                account_type_source = CASE WHEN ? IS NOT NULL THEN 'plugin' ELSE account_type_source END,
                account_type_updated_at = CASE WHEN ? IS NOT NULL THEN ? ELSE account_type_updated_at END,
                last_seen = ?
             WHERE account_hash = ?`,
        )
        .run(identity.rsn, accountType, accountType, accountType, now, now, identity.accountHash);
}

function insertClanAccount(clanDb: Database.Database, identity: PluginIdentityRecord, now: number): void {
    const accountType = identity.accountType ?? null;
    const hasType = accountType !== null;
    clanDb
        .prepare(
            `INSERT INTO clan_accounts (
                account_hash, first_rsn, latest_rsn,
                account_type, account_type_source, account_type_updated_at,
                first_seen, last_seen
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
            identity.accountHash,
            identity.rsn,
            identity.rsn,
            accountType,
            hasType ? "plugin" : null,
            hasType ? now : null,
            now,
            now,
        );
}

export function upsertClanAccount(
    clanDb: Database.Database,
    identity: PluginIdentityRecord,
    existing: boolean,
    now: number,
): void {
    if (existing) updateClanAccount(clanDb, identity, now);
    else insertClanAccount(clanDb, identity, now);
}

const HISTORY_UPSERT_SQL = `INSERT INTO clan_member_history
    (account_hash, rsn, clan_id, clan_name, rank, joined_at, first_seen, last_seen)
 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
 ON CONFLICT (account_hash, clan_id) DO UPDATE SET
    rsn = excluded.rsn,
    clan_name = excluded.clan_name,
    rank = COALESCE(excluded.rank, rank),
    joined_at = COALESCE(excluded.joined_at, joined_at),
    last_seen = excluded.last_seen`;

export function upsertHistory(
    clanDb: Database.Database,
    clanId: string,
    identity: PluginIdentityRecord,
    now: number,
): void {
    if (!identity.clanName) return;
    clanDb
        .prepare(HISTORY_UPSERT_SQL)
        .run(
            identity.accountHash,
            identity.rsn,
            clanId,
            identity.clanName,
            identity.clanRank ?? null,
            identity.clanJoinedAt ?? null,
            now,
            now,
        );
}

function snapshotEligible(identity: PluginIdentityRecord): boolean {
    if (!identity.clanName) return false;
    if (identity.clanMemberCount === null || identity.clanMemberCount === undefined) return false;
    if (identity.clanOnlineCount === null || identity.clanOnlineCount === undefined) return false;
    return true;
}

export function writeSnapshot(
    clanDb: Database.Database,
    clanId: string,
    identity: PluginIdentityRecord,
    now: number,
): void {
    if (snapshotEligible(identity)) {
        clanDb
            .prepare(
                `INSERT INTO clan_snapshots
                (account_hash, rsn, clan_id, clan_name, member_count, online_count, observed_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT (account_hash, observed_at) DO NOTHING`,
            )
            .run(
                identity.accountHash,
                identity.rsn,
                clanId,
                identity.clanName,
                identity.clanMemberCount,
                identity.clanOnlineCount,
                now,
            );
    }
}
