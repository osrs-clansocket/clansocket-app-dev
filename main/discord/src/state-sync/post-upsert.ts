import { apiRequest } from "../fetchers/api-fetcher.js";
import { HTTP_METHOD_POST } from "../core/constants.js";
import { STATE_KINDS } from "../core/constants.js";

const SINGULARIZE_OVERRIDES: Record<string, string> = {
    [STATE_KINDS.SERVER_EMOJIS]: "emoji",
    [STATE_KINDS.SERVER_STICKERS]: "sticker",
};

function singularize(resource: string): string {
    return SINGULARIZE_OVERRIDES[resource] ?? (resource.endsWith("s") ? resource.slice(0, -1) : resource);
}

export function postStateUpsert<T>(
    resource: string,
    guildId: string,
    entityId: string,
    entity: T,
): Promise<{ ok: boolean } | null> {
    const path = `/api/discord/state/${resource}/${encodeURIComponent(guildId)}/${encodeURIComponent(entityId)}`;
    return apiRequest<{ ok: boolean }>(HTTP_METHOD_POST, path, { [singularize(resource)]: entity });
}
