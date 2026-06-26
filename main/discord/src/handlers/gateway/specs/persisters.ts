import { extractChannelOverwrites } from "../../../state-sync/channel-overwrites/extract.js";
import { STATE_KINDS } from "../../../core/constants.js";
import { replaceOverwrites } from "../../../state-sync/channel-overwrites/post-replace.js";
import { extractChannelRow } from "../../../state-sync/channels/extract.js";
import { postServerFeatures } from "../../../state-sync/features/post-features.js";
import { extractSettingsRow } from "../../../state-sync/guild-settings/extract.js";
import { upsertSettings } from "../../../state-sync/guild-settings/post-upsert.js";
import { postStateDelete } from "../../../state-sync/post-delete.js";
import { postStateUpsert } from "../../../state-sync/post-upsert.js";
import { extractToken, type WebhookTokenSync } from "../../../state-sync/webhooks/extract-token.js";
import { extractWebhookRow } from "../../../state-sync/webhooks/extract.js";
import { replaceWebhooks } from "../../../state-sync/webhooks/post-channel-replace.js";

export function upsertOf(kind: string, extract: (e: any) => any) {
    return (gid: string, e: any) => postStateUpsert(kind, gid, e.id, extract(e));
}

export function deleteOf(kind: string) {
    return (gid: string, e: any) => postStateDelete(kind, gid, e.id);
}

export async function persistChannelCreate(gid: string, c: any): Promise<void> {
    const row = extractChannelRow(c);
    if (row) await postStateUpsert(STATE_KINDS.CHANNELS, gid, row.channel_id, row);
}

export async function persistChannelUpdate(gid: string, c: any): Promise<void> {
    await persistChannelCreate(gid, c);
    await replaceOverwrites(gid, c.id, extractChannelOverwrites(c));
}

function sameFeatures(a: readonly string[], b: readonly string[]): boolean {
    if (a.length !== b.length) return false;
    const set = new Set(a);
    return b.every((f) => set.has(f));
}

export async function persistGuildUpdate(_gid: string, newGuild: any, oldGuild: any): Promise<void> {
    const settings = await extractSettingsRow(newGuild);
    await upsertSettings(newGuild.id, settings);
    const oldFeatures = [...oldGuild.features];
    const newFeatures = [...newGuild.features];
    if (sameFeatures(oldFeatures, newFeatures)) return;
    await postServerFeatures(newGuild.id, newFeatures);
}

export async function syncWebhooksChannel(gid: string, channel: any): Promise<void> {
    const list = [...(await channel.fetchWebhooks()).values()];
    const tokens: WebhookTokenSync[] = [];
    const botId = channel.client.user?.id ?? "";
    const botName = channel.client.user?.username ?? null;
    for (const wh of list) {
        const sync = extractToken(wh, channel.name ?? null, botId, botName);
        if (sync !== null) tokens.push(sync);
    }
    await replaceWebhooks({
        tokens,
        guildId: gid,
        channelId: channel.id,
        webhooks: list.map(extractWebhookRow),
    });
}
