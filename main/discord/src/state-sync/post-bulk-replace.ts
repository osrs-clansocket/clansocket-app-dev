import { apiRequest } from "../fetchers/api-fetcher.js";

const BULK_KEY: Record<string, string> = {
    "server-emojis": "emojis",
    "server-stickers": "stickers",
};

export function bulkReplace<T>(
    resource: string,
    guildId: string,
    items: readonly T[],
): Promise<{ ok: boolean; count: number } | null> {
    const path = `/api/discord/state/${resource}/${encodeURIComponent(guildId)}/sync`;
    const bodyKey = BULK_KEY[resource] ?? resource;
    return apiRequest<{ ok: boolean; count: number }>("POST", path, { [bodyKey]: items });
}
