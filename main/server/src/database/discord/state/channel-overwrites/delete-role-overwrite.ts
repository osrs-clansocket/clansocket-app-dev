import { runGuildSql } from "../../discord.js";

const DELETE_SQL = `DELETE FROM discord_channel_role_overwrites WHERE channel_id = ? AND role_id = ?`;

export function deleteRoleOverwrite(clanId: string, guildId: string, channelId: string, roleId: string): void {
    runGuildSql(clanId, guildId, DELETE_SQL, channelId, roleId);
}
