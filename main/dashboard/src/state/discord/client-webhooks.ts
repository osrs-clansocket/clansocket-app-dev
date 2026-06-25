import { jsonFetch } from "../../shared/fetchers/json-fetcher.js";
import type { DiscordWebhookState } from "./client-types-content.js";

export interface CreateWebhookPayload {
    userId: string;
    channelId: string;
    name: string;
    avatarUrl?: string | null;
}

export interface UpdateWebhookPayload {
    userId: string;
    before: DiscordWebhookState;
    after: DiscordWebhookState;
}
export interface DeleteWebhookPayload {
    userId: string;
    targetName: string;
    channelId: string;
}

export async function createDiscordWebhook(guildId: string, payload: CreateWebhookPayload): Promise<boolean> {
    const res = await jsonFetch(`/api/discord/webhooks/${encodeURIComponent(guildId)}`, "POST", payload);
    return res.ok;
}

export async function updateDiscordWebhook(
    guildId: string,
    webhookId: string,
    payload: UpdateWebhookPayload,
): Promise<boolean> {
    const res = await jsonFetch(
        `/api/discord/webhooks/${encodeURIComponent(guildId)}/${encodeURIComponent(webhookId)}`,
        "PATCH",
        payload,
    );
    return res.ok;
}

export async function deleteDiscordWebhook(
    guildId: string,
    webhookId: string,
    payload: DeleteWebhookPayload,
): Promise<boolean> {
    const res = await jsonFetch(
        `/api/discord/webhooks/${encodeURIComponent(guildId)}/${encodeURIComponent(webhookId)}`,
        "DELETE",
        payload,
    );
    return res.ok;
}
