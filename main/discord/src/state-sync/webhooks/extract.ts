import type { Webhook } from "discord.js";
import { orNull } from "../../shared/nullable.js";
import type { WebhookRow } from "../types.js";

const AVATAR_EXTENSION = "webp";
const AVATAR_SIZE = 1024;

function cachedChannelName(webhook: Webhook): string | null {
    if (!webhook.channelId) return null;
    const cached = webhook.client.channels.cache.get(webhook.channelId) as { name?: string | null } | undefined;
    return cached && typeof cached.name === "string" ? cached.name : null;
}

export function extractWebhookRow(webhook: Webhook): WebhookRow {
    return {
        webhook_id: webhook.id,
        guild_id: webhook.guildId ?? "",
        channel_id: webhook.channelId ?? "",
        channel_name: cachedChannelName(webhook),
        name: webhook.name,
        avatar_url: webhook.avatarURL({ extension: AVATAR_EXTENSION, size: AVATAR_SIZE }),
        application_id: webhook.applicationId,
        user_id: orNull(webhook.owner?.id),
        webhook_type: webhook.type,
        source_guild_id: orNull(webhook.sourceGuild?.id),
        source_guild_name: orNull(webhook.sourceGuild?.name),
        source_channel_id: orNull(webhook.sourceChannel?.id),
        source_channel_name: orNull(webhook.sourceChannel?.name),
    };
}
