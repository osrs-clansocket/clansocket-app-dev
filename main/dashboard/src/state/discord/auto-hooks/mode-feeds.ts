import { type DiscordChannel, type DiscordWebhook } from "../client.js";
import { createChannelsFeed } from "../channels/channels-feed.js";
import { createWebhooksFeed } from "../webhooks/webhooks-feed.js";
import type { AutoHookRow } from "./client.js";
import type { WebhookTokenRow } from "../webhook-tokens/client.js";

export interface ModeState {
    autoHooks: AutoHookRow[];
    webhooks: DiscordWebhook[];
    tokens: WebhookTokenRow[];
    channels: DiscordChannel[];
}

export function freshState(): ModeState {
    return { autoHooks: [], webhooks: [], tokens: [], channels: [] };
}

export function subscribeChannelsFeed(guildId: string, state: ModeState, render: () => void): () => void {
    const channelsFeed = createChannelsFeed(guildId);
    return channelsFeed.source.subscribe(
        (snap) => {
            state.channels = snap.rows as DiscordChannel[];
            render();
        },
        (batch) => {
            const byKey = new Map(state.channels.map((c) => [c.channel_id, c]));
            for (const d of batch.deltas) {
                if (d.op === "upsert" && d.row) byKey.set(d.key, d.row as DiscordChannel);
                else if (d.op === "remove") byKey.delete(d.key);
            }
            state.channels = [...byKey.values()];
            render();
        },
    );
}

export function subscribeWebhooksFeed(guildId: string, state: ModeState, render: () => void): () => void {
    const webhooksFeed = createWebhooksFeed(guildId);
    return webhooksFeed.source.subscribe(
        (snap) => {
            state.webhooks = snap.rows as DiscordWebhook[];
            render();
        },
        (batch) => {
            const byKey = new Map(state.webhooks.map((w) => [w.webhook_id, w]));
            for (const d of batch.deltas) {
                if (d.op === "upsert" && d.row) byKey.set(d.key, d.row as DiscordWebhook);
                else if (d.op === "remove") byKey.delete(d.key);
            }
            state.webhooks = [...byKey.values()];
            render();
        },
    );
}
