import { jsonFetch } from "../../shared/fetchers/json-fetcher.js";

export interface CreateEmoji {
    userId: string;
    name: string;
    imageDataUrl: string;
    animated: boolean;
    roleIds?: readonly string[];
}

export interface UpdateEmoji {
    userId: string;
    beforeName: string;
    name: string;
    roleIds?: readonly string[];
}

export interface DeleteEmoji {
    userId: string;
    targetName: string;
}

export async function createServerEmoji(guildId: string, payload: CreateEmoji): Promise<boolean> {
    const res = await jsonFetch(`/api/discord/server-emojis/${encodeURIComponent(guildId)}`, "POST", payload);
    return res.ok;
}

export async function updateServerEmoji(guildId: string, emojiId: string, payload: UpdateEmoji): Promise<boolean> {
    const res = await jsonFetch(
        `/api/discord/server-emojis/${encodeURIComponent(guildId)}/${encodeURIComponent(emojiId)}`,
        "PATCH",
        payload,
    );
    return res.ok;
}

export async function deleteServerEmoji(guildId: string, emojiId: string, payload: DeleteEmoji): Promise<boolean> {
    const res = await jsonFetch(
        `/api/discord/server-emojis/${encodeURIComponent(guildId)}/${encodeURIComponent(emojiId)}`,
        "DELETE",
        payload,
    );
    return res.ok;
}

export interface CreateSticker {
    userId: string;
    name: string;
    description?: string | null;
    tags?: string | null;
    imageDataUrl: string;
    formatType?: number;
}

export interface UpdateSticker {
    userId: string;
    beforeName: string;
    name: string;
    description?: string | null;
    tags?: string | null;
}

export interface DeleteSticker {
    userId: string;
    targetName: string;
}

export async function createServerSticker(guildId: string, payload: CreateSticker): Promise<boolean> {
    const res = await jsonFetch(`/api/discord/server-stickers/${encodeURIComponent(guildId)}`, "POST", payload);
    return res.ok;
}

export async function updateServerSticker(
    guildId: string,
    stickerId: string,
    payload: UpdateSticker,
): Promise<boolean> {
    const res = await jsonFetch(
        `/api/discord/server-stickers/${encodeURIComponent(guildId)}/${encodeURIComponent(stickerId)}`,
        "PATCH",
        payload,
    );
    return res.ok;
}

export async function deleteServerSticker(
    guildId: string,
    stickerId: string,
    payload: DeleteSticker,
): Promise<boolean> {
    const res = await jsonFetch(
        `/api/discord/server-stickers/${encodeURIComponent(guildId)}/${encodeURIComponent(stickerId)}`,
        "DELETE",
        payload,
    );
    return res.ok;
}
