import logger from "@clansocket/logger";
import type { Guild } from "discord.js";
import { extractChannelOverwrites } from "./channel-overwrites/extract.js";
import { replaceOverwrites } from "./channel-overwrites/post-replace.js";
import { extractPinRow } from "./channel-pins/extract.js";
import { replacePins } from "./channel-pins/post-replace.js";
import { extractToken, type WebhookTokenSync } from "./webhooks/extract-token.js";
import { extractWebhookRow } from "./webhooks/extract.js";
import { replaceWebhooks } from "./webhooks/post-channel-replace.js";
import { isWebhookCapable, type WebhookCapableChannel } from "./webhooks/webhook-capable-guard.js";

async function syncWebhooksChannel(
    guildId: string,
    channel: WebhookCapableChannel,
    botId: string,
    botName: string | null,
): Promise<void> {
    try {
        const collection = await channel.fetchWebhooks();
        const list = [...collection.values()];
        const rows = list.map(extractWebhookRow);
        const tokens: WebhookTokenSync[] = [];
        for (const wh of list) {
            const sync = extractToken(wh, channel.name ?? null, botId, botName);
            if (sync !== null) tokens.push(sync);
        }
        await replaceWebhooks({ guildId, tokens, channelId: channel.id, webhooks: rows });
    } catch (err) {
        logger.warn(`webhooks fetch failed for channel ${channel.id}: ${(err as Error).message}`);
    }
}

export async function syncAllWebhooks(
    guildId: string,
    guild: Guild,
    botId: string,
    botName: string | null,
): Promise<void> {
    for (const channel of guild.channels.cache.values()) {
        if (isWebhookCapable(channel)) await syncWebhooksChannel(guildId, channel, botId, botName);
    }
}

export async function syncAllOverwrites(guildId: string, guild: Guild): Promise<void> {
    for (const channel of guild.channels.cache.values()) {
        const overwrites = extractChannelOverwrites(channel);
        if (overwrites.length > 0) {
            await replaceOverwrites(guildId, channel.id, overwrites);
        }
    }
}

async function syncPinsChannel(guildId: string, channel: any): Promise<void> {
    try {
        const pinned = await channel.messages.fetchPins();
        const rows = pinned.items.map((item: any) => extractPinRow(item.message, guildId));
        await replacePins(guildId, channel.id, rows);
    } catch (err) {
        logger.warn(`pins fetch failed for channel ${channel.id}: ${(err as Error).message}`);
    }
}

export async function syncAllPins(guildId: string, guild: Guild): Promise<void> {
    for (const channel of guild.channels.cache.values()) {
        if (!("messages" in channel) || channel.messages === undefined) continue;
        await syncPinsChannel(guildId, channel);
    }
}
