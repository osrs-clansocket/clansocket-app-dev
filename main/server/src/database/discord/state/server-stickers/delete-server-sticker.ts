import { runGuildSql } from "../../discord.js";

const DELETE_SQL = `DELETE FROM discord_server_stickers WHERE sticker_id = ? AND guild_id = ?`;

export function deleteServerSticker(clanId: string, guildId: string, stickerId: string): void {
    runGuildSql(clanId, guildId, DELETE_SQL, stickerId, guildId);
}
