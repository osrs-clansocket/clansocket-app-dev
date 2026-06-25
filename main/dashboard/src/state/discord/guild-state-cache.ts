import { signal } from "../../dom/factory/reactive/index.js";
import { BoundedCache } from "../caches/bounded-cache.js";
import type { DiscordChannel, DiscordMember, DiscordRole } from "./client.js";
import {
    emptyCache,
    subscribeChannels,
    subscribeMembers,
    subscribeRoles,
    type GuildCache,
} from "./guild-cache-subscribers.js";

const guildDataVersionSignal = signal<number>(0);

let bumpScheduled = false;
function bumpVersion(): void {
    if (bumpScheduled) return;
    bumpScheduled = true;
    queueMicrotask(() => {
        bumpScheduled = false;
        guildDataVersionSignal.set(guildDataVersionSignal() + 1);
    });
}

const caches = new BoundedCache<string, GuildCache>({
    tag: "discord",
    maxEntries: 10,
    evictionPolicy: "lru",
    onEvict: (_guildId, cache) => {
        cache.unsubChannels?.();
        cache.unsubRoles?.();
        cache.unsubMembers?.();
    },
});

function ensureCache(guildId: string): GuildCache {
    const existing = caches.get(guildId);
    if (existing !== undefined) return existing;
    const cache = emptyCache();
    caches.set(guildId, cache);
    subscribeChannels(guildId, cache, bumpVersion);
    subscribeRoles(guildId, cache, bumpVersion);
    subscribeMembers(guildId, cache, bumpVersion);
    return cache;
}

export function guildDataVersion(): number {
    return guildDataVersionSignal();
}

export function getChannelInfo(guildId: string, channelId: string): DiscordChannel | null {
    return ensureCache(guildId).channels.get(channelId) ?? null;
}

export function getRoleInfo(guildId: string, roleId: string): DiscordRole | null {
    return ensureCache(guildId).roles.get(roleId) ?? null;
}

export function getMemberInfo(guildId: string, userId: string): DiscordMember | null {
    return ensureCache(guildId).members.get(userId) ?? null;
}

export function listChannels(guildId: string): readonly DiscordChannel[] {
    return [...ensureCache(guildId).channels.values()];
}

export function listRoles(guildId: string): readonly DiscordRole[] {
    return [...ensureCache(guildId).roles.values()];
}

export function listMembers(guildId: string): readonly DiscordMember[] {
    return [...ensureCache(guildId).members.values()];
}

export function channelNameOr(guildId: string, channelId: string, fallback: string): string {
    return getChannelInfo(guildId, channelId)?.name ?? fallback;
}

export function roleNameOr(guildId: string, roleId: string, fallback: string): string {
    return getRoleInfo(guildId, roleId)?.name ?? fallback;
}

export function memberDisplayOr(guildId: string, userId: string, fallback: string): string {
    const m = getMemberInfo(guildId, userId);
    if (!m) return fallback;
    return m.nickname ?? m.display_name ?? m.name;
}
