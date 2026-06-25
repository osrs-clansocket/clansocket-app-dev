import { runGuildSql } from "../../discord.js";

const DELETE_SQL = `DELETE FROM discord_channels WHERE channel_id = ?`;

export function deleteChannel(clanId: string, guildId: string, channelId: string): void {
    runGuildSql(clanId, guildId, DELETE_SQL, channelId);
}
