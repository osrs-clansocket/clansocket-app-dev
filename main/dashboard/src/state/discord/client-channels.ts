import { jsonFetch } from "../../shared/fetchers/json-fetcher.js";
import { sameOriginFetch } from "../../shared/fetchers/same-origin-fetcher.js";
import type { DiscordChannelPin, DiscordChannelState } from "./client-types.js";

export interface CreateChannelPayload {
    userId: string;
    name: string;
    channelType: number;
    parentId?: string | null;
    topic?: string | null;
    nsfw?: boolean;
    rateLimitPerUser?: number;
}

export interface CreateChannelResult {
    sessionId: string;
    changeId: string;
    queueId: string;
    tempId: string;
}

export interface DeleteChannelPayload {
    userId: string;
    channelName: string;
    channelType: number;
}
export interface UpdateChannelPayload {
    userId: string;
    before: DiscordChannelState;
    after: DiscordChannelState;
}

export async function fetchChannelPins(guildId: string, channelId: string): Promise<DiscordChannelPin[]> {
    const url = `/api/discord/channels/${encodeURIComponent(guildId)}/${encodeURIComponent(channelId)}/pins`;
    const res = await sameOriginFetch(url, { method: "GET" });
    if (!res.ok) return [];
    const body = (await res.json()) as { pins: DiscordChannelPin[] };
    return body.pins;
}

export async function removeDiscordServer(slug: string, guildId: string): Promise<boolean> {
    const url = `/api/discord/clans/${encodeURIComponent(slug)}/servers/${encodeURIComponent(guildId)}`;
    const res = await sameOriginFetch(url, { method: "DELETE" });
    return res.ok;
}

export async function createDiscordChannel(
    guildId: string,
    payload: CreateChannelPayload,
): Promise<CreateChannelResult | { error: string }> {
    const res = await jsonFetch(`/api/discord/channels/${encodeURIComponent(guildId)}`, "POST", payload);
    if (!res.ok) return { error: `http_${res.status}` };
    return (await res.json()) as CreateChannelResult;
}

export async function deleteDiscordChannel(
    guildId: string,
    channelId: string,
    payload: DeleteChannelPayload,
): Promise<boolean> {
    const res = await jsonFetch(
        `/api/discord/channels/${encodeURIComponent(guildId)}/${encodeURIComponent(channelId)}`,
        "DELETE",
        payload,
    );
    return res.ok;
}

export async function updateDiscordChannel(
    guildId: string,
    channelId: string,
    payload: UpdateChannelPayload,
): Promise<boolean> {
    const res = await jsonFetch(
        `/api/discord/channels/${encodeURIComponent(guildId)}/${encodeURIComponent(channelId)}`,
        "PATCH",
        payload,
    );
    return res.ok;
}
