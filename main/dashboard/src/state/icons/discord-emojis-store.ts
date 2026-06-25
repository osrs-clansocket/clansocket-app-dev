import { sameOriginFetch } from "../../shared/fetchers/same-origin-fetcher.js";
import { AsyncMemoCache } from "../caches/async-memo-cache.js";

export interface DiscordEmojiEntry {
    bot_id: string;
    emoji_id: string;
    name: string;
    animated: number;
    public_path: string | null;
    updated_at: number;
}

let emojisByName: Map<string, DiscordEmojiEntry> | null = null;
let loadingPromise: Promise<void> | null = null;

async function loadFromServer(): Promise<void> {
    const res = await sameOriginFetch("/api/discord/emojis");
    if (!res.ok) {
        emojisByName = new Map();
        return;
    }
    const body = (await res.json()) as { emojis: DiscordEmojiEntry[] };
    const map = new Map<string, DiscordEmojiEntry>();
    for (const e of body.emojis ?? []) {
        if (!map.has(e.name)) map.set(e.name, e);
    }
    emojisByName = map;
}

export function ensureLoaded(): Promise<void> {
    if (emojisByName) return Promise.resolve();
    if (loadingPromise) return loadingPromise;
    loadingPromise = loadFromServer().finally(() => {
        loadingPromise = null;
    });
    return loadingPromise;
}

export function discordEmojiEntry(name: string): DiscordEmojiEntry | undefined {
    return emojisByName?.get(name);
}

export function discordEmojiUrl(name: string): string | null {
    const entry = emojisByName?.get(name);
    if (!entry) return null;
    const ext = entry.animated ? "gif" : "webp";
    return `https://cdn.discordapp.com/emojis/${entry.emoji_id}.${ext}`;
}

export function listNames(): readonly string[] {
    if (!emojisByName) return [];
    return Array.from(emojisByName.keys()).sort();
}

export function listEntries(): readonly DiscordEmojiEntry[] {
    if (!emojisByName) return [];
    return Array.from(emojisByName.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function urlOf(entry: DiscordEmojiEntry): string {
    if (entry.public_path !== null && entry.public_path.length > 0) return entry.public_path;
    const ext = entry.animated ? "gif" : "webp";
    return `https://cdn.discordapp.com/emojis/${entry.emoji_id}.${ext}`;
}

const guildEmojiCache = new AsyncMemoCache<string, readonly DiscordEmojiEntry[]>({
    tag: "discord",
    maxEntries: 16,
});

export async function listGuildEmojis(guildId: string): Promise<readonly DiscordEmojiEntry[]> {
    return guildEmojiCache.getOrLoad(guildId, async () => {
        const res = await sameOriginFetch(`/api/discord/emojis/by-guild/${encodeURIComponent(guildId)}`);
        if (!res.ok) return [];
        const body = (await res.json()) as { emojis: DiscordEmojiEntry[] };
        return [...body.emojis].sort((a, b) => a.name.localeCompare(b.name));
    });
}
