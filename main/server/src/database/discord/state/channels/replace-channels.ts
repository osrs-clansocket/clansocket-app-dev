import type Database from "better-sqlite3";
import { discordGuildDb, replaceGuildRows } from "../../discord.js";
import type { ChannelRow } from "../types.js";

const DELETE_BY_GUILD_SQL = `DELETE FROM discord_channels WHERE guild_id = ?`;
const INSERT_SQL = `
INSERT INTO discord_channels (
    channel_id, guild_id, name, type, parent_id, parent_name, position, topic, nsfw,
    rate_limit_per_user, bitrate, user_limit,
    thread_archived, thread_locked, thread_auto_archive_duration, thread_archive_timestamp, thread_message_count,
    updated_at
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const NSFW_TRUE = 1;
const NSFW_FALSE = 0;

function boolToInt(b: boolean | null): number | null {
    if (b === null) return null;
    return b ? 1 : 0;
}

function insertOneChannel(insertStmt: Database.Statement, c: ChannelRow, now: number): void {
    insertStmt.run(
        c.channel_id,
        c.guild_id,
        c.name,
        c.type,
        c.parent_id,
        c.parent_name,
        c.position,
        c.topic,
        c.nsfw ? NSFW_TRUE : NSFW_FALSE,
        c.rate_limit_per_user,
        c.bitrate,
        c.user_limit,
        boolToInt(c.thread_archived),
        boolToInt(c.thread_locked),
        c.thread_auto_archive_duration,
        c.thread_archive_timestamp,
        c.thread_message_count,
        now,
    );
}

export function replaceChannelsGuild(clanId: string, guildId: string, channels: readonly ChannelRow[]): void {
    const insertStmt = discordGuildDb(clanId, guildId).prepare(INSERT_SQL);
    const now = Date.now();
    replaceGuildRows({
        clanId,
        guildId,
        deleteSql: DELETE_BY_GUILD_SQL,
        rows: channels,
        upsert: (c) => insertOneChannel(insertStmt, c, now),
        debugTag: "replace-channels",
    });
}
