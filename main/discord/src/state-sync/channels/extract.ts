import type { GuildBasedChannel } from "discord.js";
import { orNull } from "../../shared/nullable.js";
import type { ChannelRow } from "../types.js";

function getOptional(obj: any, key: string, type: "string" | "number" | "boolean"): any {
    return key in obj && typeof obj[key] === type ? obj[key] : null;
}

export function extractChannelRow(channel: GuildBasedChannel | null): ChannelRow | null {
    if (!channel) return null;
    return {
        channel_id: channel.id,
        guild_id: channel.guild.id,
        name: orNull(channel.name),
        type: channel.type,
        parent_id: orNull(channel.parentId),
        parent_name: orNull(channel.parent?.name),
        nsfw: (getOptional(channel, "nsfw", "boolean") as boolean | null) ?? false,
        topic: getOptional(channel, "topic", "string") as string | null,
        position: getOptional(channel, "position", "number") as number | null,
        bitrate: getOptional(channel, "bitrate", "number") as number | null,
        rate_limit_per_user: getOptional(channel, "rateLimitPerUser", "number") as number | null,
        user_limit: getOptional(channel, "userLimit", "number") as number | null,
        thread_archived: getOptional(channel, "archived", "boolean") as boolean | null,
        thread_locked: getOptional(channel, "locked", "boolean") as boolean | null,
        thread_auto_archive_duration: getOptional(channel, "autoArchiveDuration", "number") as number | null,
        thread_archive_timestamp: getOptional(channel, "archiveTimestamp", "number") as number | null,
        thread_message_count: getOptional(channel, "messageCount", "number") as number | null,
    };
}
