import type { Client } from "discord.js";
import { HTTP_METHOD_POST } from "../../core/constants.js";
import type { PendingOutboundRow } from "../../loaders/outbound-loader.js";
import { registerSender } from "../sender-registry.js";

export const KIND_WEBHOOK_POST = "webhook_post";

const WEBHOOK_URL_BASE = "https://discord.com/api/webhooks";

interface WebhookPostPayload {
    envelope: object;
    webhookId: string;
    token: string;
}

export async function senderWebhookPost(_client: Client, event: PendingOutboundRow): Promise<string | null> {
    const payload = JSON.parse(event.payload_json) as WebhookPostPayload;
    const url = `${WEBHOOK_URL_BASE}/${encodeURIComponent(payload.webhookId)}/${encodeURIComponent(payload.token)}?wait=true`;
    const res = await fetch(url, {
        method: HTTP_METHOD_POST,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload.envelope),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`webhook POST ${res.status}: ${text}`);
    }
    const body = (await res.json()) as { id?: string };
    return body.id ?? null;
}

registerSender(KIND_WEBHOOK_POST, senderWebhookPost);
