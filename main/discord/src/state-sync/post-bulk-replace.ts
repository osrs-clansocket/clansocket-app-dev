import { apiRequest } from "../fetchers/api-fetcher.js";
import { HTTP_METHOD_POST } from "../core/constants.js";
import { STATE_KINDS } from "../core/constants.js";

const BULK_KEY: Record<string, string> = {
    [STATE_KINDS.SERVER_EMOJIS]: "emojis",
    [STATE_KINDS.SERVER_STICKERS]: "stickers",
};

export function bulkReplace<T>(
    resource: string,
    guildId: string,
    items: readonly T[],
): Promise<{ ok: boolean; count: number } | null> {
    const path = `/api/discord/state/${resource}/${encodeURIComponent(guildId)}/sync`;
    const bodyKey = BULK_KEY[resource] ?? resource;
    return apiRequest<{ ok: boolean; count: number }>(HTTP_METHOD_POST, path, { [bodyKey]: items });
}
