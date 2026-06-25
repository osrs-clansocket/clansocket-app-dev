import { apiRequest } from "../fetchers/api-fetcher.js";

export function postStateDelete(resource: string, guildId: string, entityId: string): Promise<{ ok: boolean } | null> {
    const path = `/api/discord/state/${resource}/${encodeURIComponent(guildId)}/${encodeURIComponent(entityId)}`;
    return apiRequest<{ ok: boolean }>("DELETE", path);
}
