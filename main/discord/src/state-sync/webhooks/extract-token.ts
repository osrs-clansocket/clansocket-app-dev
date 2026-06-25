import type { Webhook } from "discord.js";

export interface WebhookTokenSync {
    webhookId: string;
    webhookName: string | null;
    channelId: string;
    channelName: string | null;
    plaintextToken: string;
    acquiredByBotId: string;
    acquiredByBotName: string | null;
}

export function extractToken(
    webhook: Webhook,
    channelName: string | null,
    acquiredByBotId: string,
    acquiredByBotName: string | null,
): WebhookTokenSync | null {
    if (typeof webhook.token !== "string" || webhook.token.length === 0) return null;
    return {
        channelName,
        acquiredByBotId,
        acquiredByBotName,
        webhookId: webhook.id,
        webhookName: webhook.name ?? null,
        channelId: webhook.channelId ?? "",
        plaintextToken: webhook.token,
    };
}
