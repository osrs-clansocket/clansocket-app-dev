import { clanAuditDb } from "../../../database/core/database.js";
import { getClanDb, discordGuildDb } from "../../../database/index.js";
import { guildIdsOf } from "../../discord-guild-iterator.js";
import {
    CLAN_AUDIT_DB_SITE_ACCOUNT_TABLES,
    CLAN_DB_SITE_ACCOUNT_TABLES,
    CLAN_DB_USER_TABLES,
    DISCORD_GUILD_DB_SITE_ACCOUNT_TABLES,
} from "../../scopes/manifest/index.js";
import { resolveClanWindows, ownedMembers, ownedDiffs } from "../../temporal-correlation.js";
import { selectAll, stripBlobs } from "./db-select.js";
import type { ClanSummary, ZipEntry } from "./types.js";

export interface CollectClanDb {
    clanId: string;
    accountHash: string;
    siteAccountId: string;
    entries: ZipEntry[];
    clanSummary: ClanSummary;
}

function collectScopedTables(
    clanDb: ReturnType<typeof getClanDb>,
    specs: typeof CLAN_DB_USER_TABLES,
    scopeValue: string,
    args: CollectClanDb,
): void {
    for (const { table, column } of specs) {
        const rows = selectAll(clanDb, table, `${column} = ?`, scopeValue);
        if (rows.length === 0) continue;
        args.entries.push({ path: `clans/${args.clanId}/clan.db/${table}.json`, json: rows });
        args.clanSummary.clanDbTables[table] = rows.length;
    }
}

function collectRosterFootprint(args: CollectClanDb): void {
    const windows = resolveClanWindows(args.clanId, [args.accountHash]);
    if (windows.length === 0) return;
    const members = ownedMembers(args.clanId, windows);
    if (members.length > 0) {
        args.entries.push({ path: `clans/${args.clanId}/clan.db/clan_members.json`, json: members });
        args.clanSummary.clanDbTables.clan_members = members.length;
    }
    const diffs = ownedDiffs(args.clanId, windows);
    if (diffs.length > 0) {
        args.entries.push({ path: `clans/${args.clanId}/clan.db/clan_roster_diffs.json`, json: diffs });
        args.clanSummary.clanDbTables.clan_roster_diffs = diffs.length;
    }
}

export function collectClanTables(args: CollectClanDb): void {
    const clanDb = getClanDb(args.clanId);
    collectScopedTables(clanDb, CLAN_DB_USER_TABLES, args.accountHash, args);
    collectScopedTables(clanDb, CLAN_DB_SITE_ACCOUNT_TABLES, args.siteAccountId, args);
    collectRosterFootprint(args);
}

export function collectAuditTables(
    clanId: string,
    siteAccountId: string,
    entries: ZipEntry[],
    clanSummary: ClanSummary,
): void {
    const auditDb = clanAuditDb(clanId);
    for (const { table, column } of CLAN_AUDIT_DB_SITE_ACCOUNT_TABLES) {
        const rows = selectAll(auditDb, table, `${column} = ?`, siteAccountId);
        if (rows.length === 0) continue;
        entries.push({ path: `clans/${clanId}/clan_audit.db/${table}.json`, json: rows });
        clanSummary.clanDbTables[table] = rows.length;
    }
}

interface OneGuildArgs {
    clanId: string;
    guildId: string;
    siteAccountId: string;
    entries: ZipEntry[];
    clanSummary: ClanSummary;
}

function collectOneGuild(args: OneGuildArgs): void {
    const { clanId, guildId, siteAccountId, entries, clanSummary } = args;
    const db = discordGuildDb(clanId, guildId);
    const pathPrefix = `clans/${clanId}/discord_guild_${guildId}.db`;
    for (const { table, column, excludeColumns } of DISCORD_GUILD_DB_SITE_ACCOUNT_TABLES) {
        const raw = selectAll(db, table, `${column} = ?`, siteAccountId);
        if (raw.length === 0) continue;
        const rows = excludeColumns ? stripBlobs(raw, [...excludeColumns]) : raw;
        entries.push({ path: `${pathPrefix}/${table}.json`, json: rows });
        clanSummary.clanDbTables[`${table}@${guildId}`] = rows.length;
    }
    collectGuildChildren({ db, siteAccountId, entries, clanSummary, pathPrefix, guildId });
}

export function collectGuildTables(
    clanId: string,
    siteAccountId: string,
    entries: ZipEntry[],
    clanSummary: ClanSummary,
): void {
    for (const guildId of guildIdsOf(clanId)) {
        collectOneGuild({ clanId, guildId, siteAccountId, entries, clanSummary });
    }
}

interface CollectGuildChildren {
    db: ReturnType<typeof discordGuildDb>;
    siteAccountId: string;
    entries: ZipEntry[];
    clanSummary: ClanSummary;
    pathPrefix: string;
    guildId: string;
}

function collectGuildChildren(args: CollectGuildChildren): void {
    const { db, siteAccountId, entries, clanSummary, pathPrefix, guildId } = args;
    const draftChildSql = `session_id IN (SELECT session_id FROM discord_draft_sessions WHERE owner_site_account_id = ?)`;
    for (const childTable of ["discord_draft_changes", "discord_draft_publish_queue"]) {
        const rows = selectAll(db, childTable, draftChildSql, siteAccountId);
        if (rows.length === 0) continue;
        entries.push({ path: `${pathPrefix}/${childTable}.json`, json: rows });
        clanSummary.clanDbTables[`${childTable}@${guildId}`] = rows.length;
    }
    const depsSql = `change_id IN (SELECT change_id FROM discord_draft_changes WHERE ${draftChildSql})`;
    const deps = selectAll(db, "discord_draft_change_deps", depsSql, siteAccountId);
    if (deps.length > 0) {
        entries.push({ path: `${pathPrefix}/discord_draft_change_deps.json`, json: deps });
        clanSummary.clanDbTables[`discord_draft_change_deps@${guildId}`] = deps.length;
    }
}
