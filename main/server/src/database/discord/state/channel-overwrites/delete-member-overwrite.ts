import { runGuildSql } from "../../discord.js";

const DELETE_SQL = `DELETE FROM discord_channel_member_overwrites WHERE channel_id = ? AND user_id = ?`;

export function deleteMemberOverwrite(clanId: string, guildId: string, channelId: string, userId: string): void {
    runGuildSql(clanId, guildId, DELETE_SQL, channelId, userId);
}
