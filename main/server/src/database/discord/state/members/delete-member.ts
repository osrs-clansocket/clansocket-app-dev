import { runGuildSql } from "../../discord.js";

const DELETE_SQL = `DELETE FROM discord_members WHERE user_id = ? AND guild_id = ?`;

export function deleteMember(clanId: string, guildId: string, userId: string): void {
    runGuildSql(clanId, guildId, DELETE_SQL, userId, guildId);
}
