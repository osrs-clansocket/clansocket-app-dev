import {
    ChannelType,
    type ForumChannel,
    type GuildBasedChannel,
    type MediaChannel,
    type NewsChannel,
    type StageChannel,
    type TextChannel,
    type VoiceChannel,
} from "discord.js";

export type WebhookCapableChannel =
    | TextChannel
    | NewsChannel
    | VoiceChannel
    | StageChannel
    | ForumChannel
    | MediaChannel;

const WEBHOOK_CAPABLE_TYPES = new Set<ChannelType>([
    ChannelType.GuildText,
    ChannelType.GuildAnnouncement,
    ChannelType.GuildVoice,
    ChannelType.GuildStageVoice,
    ChannelType.GuildForum,
    ChannelType.GuildMedia,
]);

export function isWebhookCapable(channel: GuildBasedChannel | null | undefined): channel is WebhookCapableChannel {
    if (!channel) return false;
    return WEBHOOK_CAPABLE_TYPES.has(channel.type);
}

export function assertWebhookCapable(
    channel: GuildBasedChannel | null | undefined,
    errorMsg: string,
): asserts channel is WebhookCapableChannel {
    if (!isWebhookCapable(channel)) throw new Error(errorMsg);
}
