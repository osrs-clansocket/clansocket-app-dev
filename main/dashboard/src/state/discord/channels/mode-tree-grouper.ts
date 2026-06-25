import type { DiscordChannel, DiscordWebhook } from "../client.js";
import { CATEGORY_TYPE, THREAD_TYPES } from "../../../dom/pages/clans/manage/discord/modes/channels/mode-constants.js";

function pushToBucket(map: Map<string, DiscordChannel[]>, key: string, channel: DiscordChannel): void {
    const arr = map.get(key) ?? [];
    arr.push(channel);
    map.set(key, arr);
}

export function groupTreeChannels(channels: readonly DiscordChannel[]): {
    categories: DiscordChannel[];
    childrenByCat: Map<string, DiscordChannel[]>;
    threadsByParent: Map<string, DiscordChannel[]>;
    orphans: DiscordChannel[];
} {
    const categories = channels.filter((c) => c.type === CATEGORY_TYPE);
    const catIds = new Set(categories.map((c) => c.channel_id));
    const childrenByCat = new Map<string, DiscordChannel[]>();
    const threadsByParent = new Map<string, DiscordChannel[]>();
    const orphans: DiscordChannel[] = [];
    for (const ch of channels) {
        if (ch.type === CATEGORY_TYPE) continue;
        const isThread = THREAD_TYPES.has(ch.type);
        if (isThread && ch.parent_id !== null) pushToBucket(threadsByParent, ch.parent_id, ch);
        else if (!isThread && ch.parent_id !== null && catIds.has(ch.parent_id))
            pushToBucket(childrenByCat, ch.parent_id, ch);
        else orphans.push(ch);
    }
    return { categories, childrenByCat, threadsByParent, orphans };
}

export function groupWebhooks(webhooks: readonly DiscordWebhook[]): Map<string, DiscordWebhook[]> {
    const map = new Map<string, DiscordWebhook[]>();
    for (const w of webhooks) {
        const arr = map.get(w.channel_id) ?? [];
        arr.push(w);
        map.set(w.channel_id, arr);
    }
    return map;
}
