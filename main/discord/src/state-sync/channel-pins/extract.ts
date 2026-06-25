import type { Message } from "discord.js";
import type { ChannelPinRow } from "../types.js";

export function extractPinRow(message: Message, guildId: string): ChannelPinRow {
    const attachments = [...message.attachments.values()].map((a) => a.url);
    const channel = message.channel as { name?: string | null } | null;
    const channelName = channel && typeof channel.name === "string" ? channel.name : null;
    return {
        message_id: message.id,
        channel_id: message.channelId,
        channel_name: channelName,
        guild_id: guildId,
        author_user_id: message.author?.id ?? null,
        author_user_name: message.author?.username ?? null,
        content: message.content,
        timestamp: message.createdTimestamp,
        attachments,
    };
}
