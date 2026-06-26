import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { clanDirPath } from "../../../database/core/database.js";
import { DB_NAMES, pluginModes } from "../../../database/index.js";
import { selectRows } from "../../../shared/loaders/db-rows.js";
import { closeByHash } from "../../../plugin-api/session/account-cap.js";
import { userIdFor } from "../../scopes/user-scope/open-db.js";
import { purgeAudit, purgeClanDb } from "./clan-tables.js";
import { purgeGuild } from "./guild-tables.js";
import { purgePluginModes } from "./plugin-tables.js";
import { purgeAppTables, purgeBotTables, purgeVarezTables } from "./top-level.js";
import { emptyResult, clanIds, type PurgeUserResult } from "./types.js";

export interface PurgeUserOptions {
    preserveRoster?: boolean;
}

interface ClanPurgePresence {
    hasClanDb: boolean;
    hasAuditDb: boolean;
    hasAnyMode: boolean;
}

function purgePresence(clanId: string): ClanPurgePresence {
    const clanDir = clanDirPath(clanId);
    return {
        hasClanDb: existsSync(resolve(clanDir, "clan.db")),
        hasAuditDb: existsSync(resolve(clanDir, "clan_audit.db")),
        hasAnyMode: pluginModes(clanId).length > 0,
    };
}

interface PurgeClanArgs {
    clanId: string;
    accountHash: string;
    siteAccountId: string;
    result: PurgeUserResult;
    preserveRoster: boolean;
}

function runPurgeSteps(args: PurgeClanArgs, presence: { hasAuditDb: boolean; hasClanDb: boolean }): boolean {
    const { clanId, accountHash, siteAccountId, result, preserveRoster } = args;
    const steps = [
        presence.hasAuditDb ? purgeAudit(clanId, siteAccountId, result) : false,
        presence.hasClanDb ? purgeClanDb({ clanId, accountHash, siteAccountId, result, preserveRoster }) : false,
        purgePluginModes(clanId, accountHash, result),
        purgeGuild(clanId, siteAccountId, result),
    ];
    return steps.some(Boolean);
}

function purgeOneClan(args: PurgeClanArgs): void {
    const presence = purgePresence(args.clanId);
    if (!presence.hasClanDb && !presence.hasAuditDb && !presence.hasAnyMode) return;
    if (runPurgeSteps(args, presence)) args.result.clansTouched += 1;
}

export function purgeUserData(
    accountHash: string,
    siteAccountId: string,
    opts: PurgeUserOptions = {},
): PurgeUserResult {
    const preserveRoster = opts.preserveRoster === true;
    const result = emptyResult(accountHash, siteAccountId);
    result.socketsClosed = closeByHash(accountHash);
    purgeAppTables(accountHash, siteAccountId, result);
    purgeVarezTables(siteAccountId, result);
    const discordUserId = userIdFor(siteAccountId);
    purgeBotTables(siteAccountId, discordUserId, result);
    for (const clanId of clanIds()) {
        purgeOneClan({ clanId, accountHash, siteAccountId, result, preserveRoster });
    }
    return result;
}

export function ownedClans(accountHash: string): Array<{ id: string; slug: string; display_name: string }> {
    return selectRows<{ id: string; slug: string; display_name: string }>(
        DB_NAMES.APP,
        `SELECT id, slug, display_name FROM clansocket_clans
         WHERE owner_account_hash = ? AND archived_at IS NULL`,
        accountHash,
    );
}
