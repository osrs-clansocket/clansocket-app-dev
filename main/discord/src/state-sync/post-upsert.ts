import { apiRequest } from "../fetchers/api-fetcher.js";

const SINGULARIZE_OVERRIDES: Record<string, string> = {
    "server-emojis": "emoji",
    "server-stickers": "sticker",
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
    return apiRequest<{ ok: boolean }>("POST", path, { [singularize(resource)]: entity });
}
