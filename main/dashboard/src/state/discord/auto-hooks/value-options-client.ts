import { sameOriginFetch } from "../../../shared/fetchers/same-origin-fetcher.js";
import { jsonOrFallback } from "../../fetch-result.js";

export async function fetchOptions(guildId: string, triggerType: string, field: string): Promise<readonly string[]> {
    const url =
        `/api/discord/auto-hook-conditions/value-options/${encodeURIComponent(guildId)}` +
        `?trigger=${encodeURIComponent(triggerType)}` +
        `&field=${encodeURIComponent(field)}`;
    const res = await sameOriginFetch(url);
    const body = await jsonOrFallback<{ values?: readonly string[] }>(res, {});
    return body.values ?? [];
}
