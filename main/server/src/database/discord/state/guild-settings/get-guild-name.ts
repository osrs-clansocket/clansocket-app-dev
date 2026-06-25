import { discordGuildDb } from "../../discord.js";

const SELECT_SQL = `SELECT name FROM discord_guild_settings WHERE guild_id = ?`;

export function guildName(clanId: string, guildId: string): string | null {
    const db = discordGuildDb(clanId, guildId);
    const row = db.prepare(SELECT_SQL).get(guildId) as { name: string | null } | undefined;
    return row?.name ?? null;
}
