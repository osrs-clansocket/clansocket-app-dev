import { discordGuildDb } from "../../../database/index.js";
import { guildIdsOf } from "../../discord-guild-iterator.js";
import { DISCORD_GUILD_DB_SITE_ACCOUNT_TABLES } from "../../scopes/manifest/index.js";
import { statOne } from "./stat-ops.js";
import type { StatsAcc } from "./per-clan-stats.js";
import { acc } from "./utils.js";

function oneGuildStats(s: StatsAcc, clanId: string, guildId: string, siteAccountId: string): void {
    const guildDb = discordGuildDb(clanId, guildId);
    const guildDbKey = `discord_guild:${clanId}:${guildId}`;
    for (const { table, column } of DISCORD_GUILD_DB_SITE_ACCOUNT_TABLES) {
        acc(s.stats, s.dbsTouched, guildDbKey, statOne(guildDb, table, column, siteAccountId));
    }
}

export function collectGuildStats(s: StatsAcc, clanId: string, siteAccountId: string): void {
    for (const guildId of guildIdsOf(clanId)) {
        oneGuildStats(s, clanId, guildId, siteAccountId);
    }
}
