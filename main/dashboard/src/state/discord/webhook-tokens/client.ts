import { jsonFetch } from "../../../shared/fetchers/json-fetcher.js";
import { sameOriginFetch } from "../../../shared/fetchers/same-origin-fetcher.js";

export interface WebhookTokenRow {
    webhook_id: string;
    guild_id: string;
    channel_id: string;
    channel_name: string | null;
    acquired_by_bot_id: string | null;
    bound_by_site_account_id: string | null;
    bound_by_site_account_name: string | null;
    bound_at: number;
    last_used_at: number | null;
    revoked_at: number | null;
    updated_at: number;
}

export interface RevokeWebhook {
    userId: string;
    webhookName: string;
}

export async function listWebhookTokens(guildId: string): Promise<WebhookTokenRow[]> {
    const url = `/api/discord/webhook-tokens/${encodeURIComponent(guildId)}`;
    const res = await sameOriginFetch(url, { method: "GET" });
    if (!res.ok) return [];
    const body = (await res.json()) as { tokens: WebhookTokenRow[] };
    return body.tokens;
}

export async function revokeWebhookToken(guildId: string, webhookId: string, payload: RevokeWebhook): Promise<boolean> {
    const url = `/api/discord/webhook-tokens/${encodeURIComponent(guildId)}/${encodeURIComponent(webhookId)}`;
    const res = await jsonFetch(url, "DELETE", payload);
    return res.ok;
}
