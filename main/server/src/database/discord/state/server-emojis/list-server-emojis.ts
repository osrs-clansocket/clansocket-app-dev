import { listGuildRows } from "../list-guild-rows.js";
import type { ServerEmojiRow } from "../types.js";

const LIST_SQL = `
SELECT emoji_id, guild_id, name, role_ids_json, animated, available, managed, image_url, user_id
FROM discord_server_emojis
WHERE guild_id = ?
ORDER BY LOWER(name) ASC
`;

interface EmojiSqlRow {
    emoji_id: string;
    guild_id: string;
    name: string;
    role_ids_json: string;
    animated: number;
    available: number;
    managed: number;
    image_url: string | null;
    user_id: string | null;
}

const FLAG_TRUE = 1;

function parseRoleIds(json: string): string[] {
    try {
        const parsed = JSON.parse(json) as unknown;
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((v): v is string => typeof v === "string");
    } catch {
        return [];
    }
}

function toEmojiRow(r: EmojiSqlRow): ServerEmojiRow {
    return {
        emoji_id: r.emoji_id,
        guild_id: r.guild_id,
        name: r.name,
        role_ids: parseRoleIds(r.role_ids_json),
        animated: r.animated === FLAG_TRUE,
        available: r.available === FLAG_TRUE,
        managed: r.managed === FLAG_TRUE,
        image_url: r.image_url,
        user_id: r.user_id,
    };
}

export function emojisByGuild(clanId: string, guildId: string): ServerEmojiRow[] {
    return listGuildRows<EmojiSqlRow, ServerEmojiRow>(clanId, guildId, LIST_SQL, toEmojiRow);
}
