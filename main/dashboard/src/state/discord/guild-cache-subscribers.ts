import {
    openChannelsStream,
    openMembersStream,
    openRolesStream,
    type DiscordChannel,
    type DiscordMember,
    type DiscordRole,
} from "./client.js";

export interface GuildCache {
    channels: Map<string, DiscordChannel>;
    roles: Map<string, DiscordRole>;
    members: Map<string, DiscordMember>;
    unsubChannels: (() => void) | null;
    unsubRoles: (() => void) | null;
    unsubMembers: (() => void) | null;
}

export function emptyCache(): GuildCache {
    return {
        channels: new Map(),
        roles: new Map(),
        members: new Map(),
        unsubChannels: null,
        unsubRoles: null,
        unsubMembers: null,
    };
}

interface DeltaLike {
    op: "upsert" | "remove";
    key: string;
    row?: unknown;
}

function applyDeltas<T>(target: Map<string, T>, deltas: readonly DeltaLike[]): void {
    for (const d of deltas) {
        if (d.op === "upsert" && d.row) target.set(d.key, d.row as T);
        else if (d.op === "remove") target.delete(d.key);
    }
}

export function subscribeChannels(guildId: string, cache: GuildCache, bump: () => void): void {
    cache.unsubChannels = openChannelsStream(
        guildId,
        (snap) => {
            cache.channels.clear();
            for (const row of snap.rows as DiscordChannel[]) cache.channels.set(row.channel_id, row);
            bump();
        },
        (batch) => {
            applyDeltas(cache.channels, batch.deltas);
            bump();
        },
    );
}

export function subscribeRoles(guildId: string, cache: GuildCache, bump: () => void): void {
    cache.unsubRoles = openRolesStream(
        guildId,
        (snap) => {
            cache.roles.clear();
            for (const row of snap.rows as DiscordRole[]) cache.roles.set(row.role_id, row);
            bump();
        },
        (batch) => {
            applyDeltas(cache.roles, batch.deltas);
            bump();
        },
    );
}

export function subscribeMembers(guildId: string, cache: GuildCache, bump: () => void): void {
    cache.unsubMembers = openMembersStream(
        guildId,
        (snap) => {
            cache.members.clear();
            for (const row of snap.rows as DiscordMember[]) cache.members.set(row.user_id, row);
            bump();
        },
        (batch) => {
            applyDeltas(cache.members, batch.deltas);
            bump();
        },
    );
}
