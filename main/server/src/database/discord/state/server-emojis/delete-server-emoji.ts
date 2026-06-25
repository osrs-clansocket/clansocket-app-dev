import { runGuildSql } from "../../discord.js";

const DELETE_SQL = `DELETE FROM discord_server_emojis WHERE emoji_id = ? AND guild_id = ?`;

export function deleteServerEmoji(clanId: string, guildId: string, emojiId: string): void {
    runGuildSql(clanId, guildId, DELETE_SQL, emojiId, guildId);
}
