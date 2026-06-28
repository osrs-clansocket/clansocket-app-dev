import type { Database } from "better-sqlite3";
import { discordGuildDb } from "../../../database/discord/discord.js";
import { listByClan } from "../../../database/discord/servers/list-by-clan.js";

export interface MultiGuildQuery<T> {
    readonly sql: string;
    readonly mapRow: (row: T) => { id: string; name: string; kind?: string };
}

function selectRows<T>(db: Database, sql: string): T[] {
    return db.prepare(sql).all() as T[];
}

export async function queryAcrossGuilds<T>(
    clanId: string,
    query: MultiGuildQuery<T>,
): Promise<readonly { id: string; name: string; kind?: string }[]> {
    const guildIds = listByClan(clanId).map((row) => row.guild_id);
    const out: { id: string; name: string; kind?: string }[] = [];
    for (const guildId of guildIds) {
        const db = discordGuildDb(clanId, guildId);
        const rows = selectRows<T>(db, query.sql);
        for (const row of rows) out.push(query.mapRow(row));
    }
    return out;
}
