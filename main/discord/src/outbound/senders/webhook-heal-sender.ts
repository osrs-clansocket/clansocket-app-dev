import logger from "@clansocket/logger";
import type { Client, Webhook } from "discord.js";
import type { PendingOutboundRow } from "../../loaders/outbound-loader.js";
import { extractWebhookRow } from "../../state-sync/webhooks/extract.js";
import { extractToken, type WebhookTokenSync } from "../../state-sync/webhooks/extract-token.js";
import { replaceWebhooks } from "../../state-sync/webhooks/post-channel-replace.js";
import { assertWebhookCapable } from "../../state-sync/webhooks/webhook-capable-guard.js";
import { registerSender } from "../sender-registry.js";

export const KIND_WEBHOOK_HEAL = "webhook_heal";

interface WebhookHealPayload {
    oldWebhookId: string;
    channelId: string;
    name: string;
    avatarUrl: string | null;
}

function collectWebhookTokens(
    list: Webhook[],
    channelName: string | null,
    botId: string,
    botName: string | null,
): WebhookTokenSync[] {
    const tokens: WebhookTokenSync[] = [];
    for (const wh of list) {
        const tk = extractToken(wh, channelName, botId, botName);
        if (tk !== null) tokens.push(tk);
    }
    return tokens;
}

async function prepareHealedChannel(
    client: Client,
    payload: WebhookHealPayload,
): Promise<{ channel: any; newWebhook: Webhook }> {
    const channelRaw = await client.channels.fetch(payload.channelId);
    if (!channelRaw) throw new Error(`invalid channel for heal: not found (channelId=${payload.channelId})`);
    const channel = channelRaw as any;
    assertWebhookCapable(channel, `invalid channel for heal: not webhook-capable (channelId=${payload.channelId})`);
    const createOpts: { name: string; avatar?: string } = { name: payload.name };
    if (payload.avatarUrl) createOpts.avatar = payload.avatarUrl;
    const newWebhook = await channel.createWebhook(createOpts);
    try {
        await (
            await client.fetchWebhook(payload.oldWebhookId)
        ).delete("Replaced with bot-owned webhook for app emoji support");
    } catch (err: any) {
        logger.warn(`webhook heal: old ${payload.oldWebhookId} delete failed: ${err.message}`);
    }
    return { channel, newWebhook };
}

export async function senderWebhookHeal(client: Client, event: PendingOutboundRow): Promise<string | null> {
    const payload = JSON.parse(event.payload_json) as WebhookHealPayload;
    const { channel, newWebhook } = await prepareHealedChannel(client, payload);
    const channelName = "name" in channel && typeof channel.name === "string" ? channel.name : null;
    const list = [...(await channel.fetchWebhooks()).values()] as Webhook[];
    await replaceWebhooks({
        tokens: collectWebhookTokens(list, channelName, client.user?.id ?? "", client.user?.username ?? null),
        guildId: event.guild_id,
        channelId: payload.channelId,
        webhooks: list.map(extractWebhookRow),
        replacement: { oldWebhookId: payload.oldWebhookId, newWebhookId: newWebhook.id },
    });
    return newWebhook.id;
}

registerSender(KIND_WEBHOOK_HEAL, senderWebhookHeal);
