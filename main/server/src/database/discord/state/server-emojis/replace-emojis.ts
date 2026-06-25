import { replaceGuildRows } from "../../discord.js";
import type { ServerEmojiRow } from "../types.js";
import { upsertServerEmoji } from "./upsert-server-emoji.js";

const DELETE_ALL_SQL = `DELETE FROM discord_server_emojis WHERE guild_id = ?`;

export function replaceEmojis(clanId: string, guildId: string, rows: readonly ServerEmojiRow[]): void {
    replaceGuildRows({
        clanId,
        guildId,
        rows,
        deleteSql: DELETE_ALL_SQL,
        upsert: (row) => upsertServerEmoji(clanId, guildId, row),
    });
}
