import { apiRequest } from "../../fetchers/api-fetcher.js";
import { HTTP_METHOD_POST } from "../../core/constants.js";

export function postServerFeatures(
    guildId: string,
    features: readonly string[],
): Promise<{ ok: boolean; count: number } | null> {
    const path = `/api/discord/state/servers/${encodeURIComponent(guildId)}/features`;
    return apiRequest<{ ok: boolean; count: number }>(HTTP_METHOD_POST, path, { features });
}
