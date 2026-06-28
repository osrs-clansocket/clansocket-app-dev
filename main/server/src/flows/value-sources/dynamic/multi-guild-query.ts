import type { Database } from "better-sqlite3";
import { discordGuildDb } from "../../../database/discord/discord.js";
import { listByClan } from "../../../database/discord/servers/list-by-clan.js";

export interface GuildContext {
    readonly guildId: string;
    readonly guildName: string;
}

export interface MultiGuildQuery<T> {
    readonly sql: string;
    readonly mapRow: (row: T, ctx: GuildContext) => { id: string; name: string; kind?: string };
}

function selectRows<T>(db: Database, sql: string): T[] {
    return db.prepare(sql).all() as T[];
}

export async function queryAcrossGuilds<T>(
    clanId: string,
    query: MultiGuildQuery<T>,
): Promise<readonly { id: string; name: string; kind?: string }[]> {
    const servers = listByClan(clanId);
    const out: { id: string; name: string; kind?: string }[] = [];
    for (const server of servers) {
        const ctx: GuildContext = { guildId: server.guild_id, guildName: server.guild_name };
        const db = discordGuildDb(clanId, server.guild_id);
        const rows = selectRows<T>(db, query.sql);
        for (const row of rows) out.push(query.mapRow(row, ctx));
    }
    return out;
}
