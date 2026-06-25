import { discordGuildDb } from "../discord.js";

export function selectGuildRows<TSql>(clanId: string, guildId: string, sql: string, ...args: unknown[]): TSql[] {
    return discordGuildDb(clanId, guildId)
        .prepare(sql)
        .all(...args) as TSql[];
}

export function listGuildRows<TSql, TRow>(
    clanId: string,
    guildId: string,
    sql: string,
    map: (row: TSql) => TRow,
): TRow[] {
    return selectGuildRows<TSql>(clanId, guildId, sql, guildId).map(map);
}
