import { replaceGuildRows } from "../../discord.js";
import type { ServerStickerRow } from "../types.js";
import { upsertServerSticker } from "./upsert-server-sticker.js";

const DELETE_ALL_SQL = `DELETE FROM discord_server_stickers WHERE guild_id = ?`;

export function replaceStickers(clanId: string, guildId: string, rows: readonly ServerStickerRow[]): void {
    replaceGuildRows({
        clanId,
        guildId,
        rows,
        deleteSql: DELETE_ALL_SQL,
        upsert: (row) => upsertServerSticker(clanId, guildId, row),
    });
}
