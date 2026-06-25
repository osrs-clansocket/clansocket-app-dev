import { listGuildRows } from "../list-guild-rows.js";
import type { ServerStickerRow } from "../types.js";

const LIST_SQL = `
SELECT sticker_id, guild_id, name, description, tags, format_type, available, image_url, user_id
FROM discord_server_stickers
WHERE guild_id = ?
ORDER BY LOWER(name) ASC
`;

interface StickerSqlRow {
    sticker_id: string;
    guild_id: string;
    name: string;
    description: string | null;
    tags: string | null;
    format_type: number;
    available: number;
    image_url: string | null;
    user_id: string | null;
}

const FLAG_TRUE = 1;

function toStickerRow(r: StickerSqlRow): ServerStickerRow {
    return {
        sticker_id: r.sticker_id,
        guild_id: r.guild_id,
        name: r.name,
        description: r.description,
        tags: r.tags,
        format_type: r.format_type,
        available: r.available === FLAG_TRUE,
        image_url: r.image_url,
        user_id: r.user_id,
    };
}

export function stickersByGuild(clanId: string, guildId: string): ServerStickerRow[] {
    return listGuildRows<StickerSqlRow, ServerStickerRow>(clanId, guildId, LIST_SQL, toStickerRow);
}
