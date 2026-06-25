import type { ReorderEvent } from "../../../../../../factory";
import { createChannelsFeed } from "../../../../../../../state/discord/channels/channels-feed.js";
import { createWebhooksFeed } from "../../../../../../../state/discord/webhooks/webhooks-feed.js";
import type { DiscordChannel, DiscordWebhook } from "../../../../../../../state/discord/client.js";
import { commitParentMove, computeNewPlacement, isInvalidReorder } from "./mode-actions.js";
import { groupWebhooks } from "./mode-tree.js";

export interface ChannelsModeState {
    latest: readonly DiscordChannel[];
    latestWebhooks: readonly DiscordWebhook[];
    webhooksByChannel: Map<string, DiscordWebhook[]>;
    initialized: boolean;
    expanded: Set<string>;
}

export function emptyChannelsState(): ChannelsModeState {
    return {
        latest: [],
        latestWebhooks: [],
        webhooksByChannel: new Map(),
        initialized: false,
        expanded: new Set<string>(),
    };
}

export function makeLocalReorder(
    guildId: string,
    state: ChannelsModeState,
    rerender: () => void,
): (event: ReorderEvent) => void {
    return (event) => {
        const dragged = state.latest.find((c) => c.channel_id === event.dragged.key);
        const target = state.latest.find((c) => c.channel_id === event.targetKey);
        if (!dragged || !target) return;
        if (isInvalidReorder(event, dragged, target)) return;
        const placement = computeNewPlacement(state.latest, target, event.position);
        state.latest = state.latest.map((c) =>
            c.channel_id === dragged.channel_id
                ? { ...c, parent_id: placement.parent_id, position: placement.position }
                : c,
        );
        rerender();
        if (placement.parent_id !== dragged.parent_id) commitParentMove(guildId, dragged, placement.parent_id);
    };
}

export function subscribeChannelsFeed(guildId: string, state: ChannelsModeState, rerender: () => void): () => void {
    const feed = createChannelsFeed(guildId);
    return feed.source.subscribe(
        (snap) => {
            state.latest = snap.rows as DiscordChannel[];
            rerender();
        },
        (batch) => {
            const byKey = new Map(state.latest.map((c) => [c.channel_id, c]));
            for (const d of batch.deltas) {
                if (d.op === "upsert" && d.row) byKey.set(d.key, d.row as DiscordChannel);
                else if (d.op === "remove") byKey.delete(d.key);
            }
            state.latest = [...byKey.values()];
            rerender();
        },
    );
}

export function subscribeChannelsWebhooks(guildId: string, state: ChannelsModeState, rerender: () => void): () => void {
    const webhooksFeed = createWebhooksFeed(guildId);
    return webhooksFeed.source.subscribe(
        (snap) => {
            state.latestWebhooks = snap.rows as DiscordWebhook[];
            state.webhooksByChannel = groupWebhooks(state.latestWebhooks);
            rerender();
        },
        (batch) => {
            const byKey = new Map(state.latestWebhooks.map((w) => [w.webhook_id, w]));
            for (const d of batch.deltas) {
                if (d.op === "upsert" && d.row) byKey.set(d.key, d.row as DiscordWebhook);
                else if (d.op === "remove") byKey.delete(d.key);
            }
            state.latestWebhooks = [...byKey.values()];
            state.webhooksByChannel = groupWebhooks(state.latestWebhooks);
            rerender();
        },
    );
}
