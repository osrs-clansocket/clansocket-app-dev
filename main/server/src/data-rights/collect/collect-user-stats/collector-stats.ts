import { DB_NAMES, getDb } from "../../../database/index.js";
import {
    APP_TABLES_BY_ACCOUNT_HASH,
    APP_TABLES_BY_SITE_ACCOUNT,
    DISCORD_BOT_TABLES_BY_DISCORD_USER_ID,
    DISCORD_BOT_TABLES_BY_SITE_ACCOUNT,
    VAREZ_TABLES_BY_SITE_ACCOUNT,
} from "../../scopes/manifest/index.js";
import { SCOPE_APP, SCOPE_VAREZ } from "../../scopes/user-scope/index.js";
import { perClanStats, type StatsAcc } from "./per-clan-stats.js";
import { statOne } from "./stat-ops.js";
import type { UserDataStats } from "./types.js";
import { acc, clanIds, userIdFor } from "./utils.js";

const SCOPE_DISCORD_BOT = "discord_bot";

function collectAppStats(s: StatsAcc, siteAccountId: string, accountHashes: readonly string[]): void {
    const appDb = getDb(DB_NAMES.APP);
    for (const hash of accountHashes) {
        for (const { table, column } of APP_TABLES_BY_ACCOUNT_HASH) {
            acc(s.stats, s.dbsTouched, SCOPE_APP, statOne(appDb, table, column, hash));
        }
    }
    for (const { table, column } of APP_TABLES_BY_SITE_ACCOUNT) {
        acc(s.stats, s.dbsTouched, SCOPE_APP, statOne(appDb, table, column, siteAccountId));
    }
}

function collectVarezStats(s: StatsAcc, siteAccountId: string): void {
    const varezDb = getDb(DB_NAMES.AI);
    for (const { table, column } of VAREZ_TABLES_BY_SITE_ACCOUNT) {
        acc(s.stats, s.dbsTouched, SCOPE_VAREZ, statOne(varezDb, table, column, siteAccountId));
    }
}

function collectBotStats(s: StatsAcc, siteAccountId: string): void {
    const botDb = getDb(DB_NAMES.DISCORD_BOT);
    for (const { table, column } of DISCORD_BOT_TABLES_BY_SITE_ACCOUNT) {
        acc(s.stats, s.dbsTouched, SCOPE_DISCORD_BOT, statOne(botDb, table, column, siteAccountId));
    }
    const discordUserId = userIdFor(siteAccountId);
    if (discordUserId === null) return;
    for (const { table, column } of DISCORD_BOT_TABLES_BY_DISCORD_USER_ID) {
        acc(s.stats, s.dbsTouched, SCOPE_DISCORD_BOT, statOne(botDb, table, column, discordUserId));
    }
}

export function collectUserStats(siteAccountId: string, accountHashes: readonly string[]): UserDataStats {
    const s: StatsAcc = {
        stats: { totalRows: 0, totalBytes: 0, totalDbs: 0, firstEntryAt: null },
        dbsTouched: new Set<string>(),
    };
    collectAppStats(s, siteAccountId, accountHashes);
    collectVarezStats(s, siteAccountId);
    collectBotStats(s, siteAccountId);
    for (const clanId of clanIds()) perClanStats(s, clanId, siteAccountId, accountHashes);
    s.stats.totalDbs = s.dbsTouched.size;
    return s.stats;
}
