import { runGuildSql } from "../../discord.js";
import type { ServerEmojiRow } from "../types.js";

const UPSERT_SQL = `
INSERT INTO discord_server_emojis (
    emoji_id, guild_id, name, role_ids_json,
    animated, available, managed, image_url, user_id, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(emoji_id) DO UPDATE SET
    guild_id = excluded.guild_id,
    name = excluded.name,
    role_ids_json = excluded.role_ids_json,
    animated = excluded.animated,
    available = excluded.available,
    managed = excluded.managed,
    image_url = excluded.image_url,
    user_id = excluded.user_id,
    updated_at = excluded.updated_at
`;

const FLAG_TRUE = 1;
const FLAG_FALSE = 0;

export function upsertServerEmoji(clanId: string, guildId: string, row: ServerEmojiRow): void {
    runGuildSql(
        clanId,
        guildId,
        UPSERT_SQL,
        row.emoji_id,
        row.guild_id,
        row.name,
        JSON.stringify(row.role_ids),
        row.animated ? FLAG_TRUE : FLAG_FALSE,
        row.available ? FLAG_TRUE : FLAG_FALSE,
        row.managed ? FLAG_TRUE : FLAG_FALSE,
        row.image_url,
        row.user_id,
        Date.now(),
    );
}
