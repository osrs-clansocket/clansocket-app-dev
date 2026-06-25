import { discordGuildDb } from "../../discord.js";
import type { ChannelRow } from "../types.js";
import { propagateChannelName } from "./propagate-channel-name.js";

const UPSERT_SQL = `
INSERT INTO discord_channels (
    channel_id, guild_id, name, type, parent_id, parent_name, position, topic, nsfw,
    rate_limit_per_user, bitrate, user_limit,
    thread_archived, thread_locked, thread_auto_archive_duration, thread_archive_timestamp, thread_message_count,
    updated_at
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(channel_id) DO UPDATE SET
    guild_id = excluded.guild_id,
    name = excluded.name,
    type = excluded.type,
    parent_id = excluded.parent_id,
    parent_name = excluded.parent_name,
    position = excluded.position,
    topic = excluded.topic,
    nsfw = excluded.nsfw,
    rate_limit_per_user = excluded.rate_limit_per_user,
    bitrate = excluded.bitrate,
    user_limit = excluded.user_limit,
    thread_archived = excluded.thread_archived,
    thread_locked = excluded.thread_locked,
    thread_auto_archive_duration = excluded.thread_auto_archive_duration,
    thread_archive_timestamp = excluded.thread_archive_timestamp,
    thread_message_count = excluded.thread_message_count,
    updated_at = excluded.updated_at
`;

const NSFW_TRUE = 1;
const NSFW_FALSE = 0;

function boolToInt(b: boolean | null): number | null {
    if (b === null) return null;
    return b ? 1 : 0;
}

export function upsertChannel(clanId: string, guildId: string, row: ChannelRow): void {
    const db = discordGuildDb(clanId, guildId);
    db.prepare(UPSERT_SQL).run(
        row.channel_id,
        row.guild_id,
        row.name,
        row.type,
        row.parent_id,
        row.parent_name,
        row.position,
        row.topic,
        row.nsfw ? NSFW_TRUE : NSFW_FALSE,
        row.rate_limit_per_user,
        row.bitrate,
        row.user_limit,
        boolToInt(row.thread_archived),
        boolToInt(row.thread_locked),
        row.thread_auto_archive_duration,
        row.thread_archive_timestamp,
        row.thread_message_count,
        Date.now(),
    );
    propagateChannelName(clanId, guildId, row.channel_id, row.name);
}
