import type Database from "better-sqlite3";
import logger from "@clansocket/logger";
import { discordGuildDb } from "../../../database/index.js";
import { guildIdsOf } from "../../discord-guild-iterator.js";
import { DISCORD_GUILD_DB_SITE_ACCOUNT_TABLES } from "../../scopes/manifest/index.js";
import { prepareTableDelete, runDeleteStmt } from "./purge-stmt-builder.js";
import type { PurgeUserResult } from "./types.js";

function prepareChildOp(
    db: Database.Database,
    spec: [string, string],
): { childTable: string; stmt: Database.Statement } {
    const [childTable, whereSql] = spec;
    return { childTable, stmt: db.prepare(`DELETE FROM ${childTable} WHERE ${whereSql}`) };
}

interface PurgeGuildArgs {
    clanId: string;
    guildId: string;
    siteAccountId: string;
    result: PurgeUserResult;
    childOps: ReadonlyArray<[string, string]>;
}

function purgeOneGuild(args: PurgeGuildArgs): boolean {
    const { clanId, guildId, siteAccountId, result, childOps } = args;
    let touched = false;
    const db = discordGuildDb(clanId, guildId);
    const childStmts = childOps.map((spec) => prepareChildOp(db, spec));
    const tableStmts = DISCORD_GUILD_DB_SITE_ACCOUNT_TABLES.map((spec) => prepareTableDelete(db, spec));
    db.transaction(() => {
        logger.debug(
            `[purge-guild] clanId=${clanId} guildId=${guildId} childStmts=${childStmts.length} tableStmts=${tableStmts.length}`,
        );
        for (const { childTable, stmt } of childStmts) {
            if (runDeleteStmt(stmt, `${childTable}@${guildId}`, siteAccountId, result.discordTableDeletes)) {
                touched = true;
            }
        }
        for (const { table, stmt } of tableStmts) {
            if (runDeleteStmt(stmt, `${table}@${guildId}`, siteAccountId, result.discordTableDeletes)) {
                touched = true;
            }
        }
    })();
    return touched;
}

export function purgeGuild(clanId: string, siteAccountId: string, result: PurgeUserResult): boolean {
    let touched = false;
    const draftScope = `session_id IN (SELECT session_id FROM discord_draft_sessions WHERE owner_site_account_id = ?)`;
    const childOps: Array<[string, string]> = [
        ["discord_draft_change_deps", `change_id IN (SELECT change_id FROM discord_draft_changes WHERE ${draftScope})`],
        ["discord_draft_changes", draftScope],
        ["discord_draft_publish_queue", draftScope],
    ];
    for (const guildId of guildIdsOf(clanId)) {
        if (purgeOneGuild({ clanId, guildId, siteAccountId, result, childOps })) touched = true;
    }
    return touched;
}
