import { icon, TREE_ICON_CLASS, type Instance } from "../../../../../../factory";
import type { DiscordChannel } from "../../../../../../../state/discord/client.js";

export const EMPTY_TEXT = "No channels in this guild yet.";
export const UNNAMED_FALLBACK = "(unnamed)";
export const CATEGORY_TYPE = 4;
const ANNOUNCEMENT_THREAD_TYPE = 10;
const PUBLIC_THREAD_TYPE = 11;
const PRIVATE_THREAD_TYPE = 12;
export const THREAD_TYPES: ReadonlySet<number> = new Set([
    ANNOUNCEMENT_THREAD_TYPE,
    PUBLIC_THREAD_TYPE,
    PRIVATE_THREAD_TYPE,
]);
export const EMPTY_CLASS = "clans-manage__discord-channels-empty";
export const TOOLBAR_CLASS = "clans-manage__discord-channels-toolbar";
export const MODE_HOST_CLASS = "clans-manage__discord-mode";

export const CATEGORY_DRAG_KIND = "category";
export const CHANNEL_DRAG_KIND = "channel";
export const THREAD_DRAG_KIND = "thread";
export const POSITION_HALF = 0.5;
const MAX_POSITION_SENTINEL = -1;

const TYPE_ICONS: Record<number, string> = {
    0: "hash",
    2: "volume-up",
    4: "folder",
    5: "megaphone",
    13: "broadcast",
    15: "chat-square-text",
    16: "image",
};
const THREAD_ICON = "chat-text";
const FALLBACK_ICON = "question-circle";

export function iconForType(type: number): Instance {
    const name = TYPE_ICONS[type] ?? (THREAD_TYPES.has(type) ? THREAD_ICON : FALLBACK_ICON);
    return icon({ name, classes: [TREE_ICON_CLASS], context: null, meta: null });
}

export function sortedByPosition<T extends { position: number | null }>(items: readonly T[]): T[] {
    return [...items].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

export function parseFeatures(raw: string): readonly string[] {
    try {
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((v): v is string => typeof v === "string");
    } catch {
        return [];
    }
}

type ChannelClass = "category" | "thread" | "channel";

function classifyChannel(channel: DiscordChannel): ChannelClass {
    if (channel.type === CATEGORY_TYPE) return "category";
    if (THREAD_TYPES.has(channel.type)) return "thread";
    return "channel";
}

const DRAG_KIND_BY_CLASS: Record<ChannelClass, string> = {
    category: CATEGORY_DRAG_KIND,
    thread: THREAD_DRAG_KIND,
    channel: CHANNEL_DRAG_KIND,
};

const LEAF_ACCEPT_BY_CLASS: Record<ChannelClass, readonly string[]> = {
    category: [CHANNEL_DRAG_KIND],
    thread: [THREAD_DRAG_KIND],
    channel: [CHANNEL_DRAG_KIND],
};

const FOLDER_ACCEPT_BY_CLASS: Record<ChannelClass, readonly string[]> = {
    category: [CATEGORY_DRAG_KIND, CHANNEL_DRAG_KIND],
    thread: [CHANNEL_DRAG_KIND, THREAD_DRAG_KIND],
    channel: [CHANNEL_DRAG_KIND, THREAD_DRAG_KIND],
};

export function dragKind(channel: DiscordChannel): string {
    return DRAG_KIND_BY_CLASS[classifyChannel(channel)];
}

export function acceptLeaf(channel: DiscordChannel): readonly string[] {
    return LEAF_ACCEPT_BY_CLASS[classifyChannel(channel)];
}

export function acceptFolder(channel: DiscordChannel): readonly string[] {
    return FOLDER_ACCEPT_BY_CLASS[classifyChannel(channel)];
}

export function maxChildPosition(channels: readonly DiscordChannel[], parentId: string): number {
    let max = MAX_POSITION_SENTINEL;
    for (const c of channels) {
        if (c.parent_id !== parentId) continue;
        const p = c.position ?? 0;
        if (p > max) max = p;
    }
    return max;
}
