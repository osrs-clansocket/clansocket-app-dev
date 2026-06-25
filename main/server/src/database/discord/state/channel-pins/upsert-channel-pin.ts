import { discordGuildDb } from "../../discord.js";
import type { ChannelPinRow } from "../types.js";

const UPSERT_SQL = `
INSERT INTO discord_channel_pins (
    message_id, channel_id, channel_name, guild_id, author_user_id, author_user_name,
    content, timestamp, attachments_json, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(message_id) DO UPDATE SET
    channel_id = excluded.channel_id,
    channel_name = excluded.channel_name,
    guild_id = excluded.guild_id,
    author_user_id = excluded.author_user_id,
    author_user_name = excluded.author_user_name,
    content = excluded.content,
    timestamp = excluded.timestamp,
    attachments_json = excluded.attachments_json,
    updated_at = excluded.updated_at
`;

export function upsertChannelPin(clanId: string, guildId: string, row: ChannelPinRow): void {
    const db = discordGuildDb(clanId, guildId);
    db.prepare(UPSERT_SQL).run(
        row.message_id,
        row.channel_id,
        row.channel_name,
        row.guild_id,
        row.author_user_id,
        row.author_user_name,
        row.content,
        row.timestamp,
        JSON.stringify(row.attachments),
        Date.now(),
    );
}
