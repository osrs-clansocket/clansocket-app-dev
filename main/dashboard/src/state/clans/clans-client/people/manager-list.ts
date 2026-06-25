import { identityClient } from "../../../identity/identity-client/index.js";
import { jsonOrFallback } from "../../../fetch-result.js";
import type { ClanManagerRow } from "./types.js";

export async function listClanManagers(slug: string): Promise<ClanManagerRow[]> {
    const res = await identityClient.authedFetch(`/api/clans/${encodeURIComponent(slug)}/managers`);
    const body = await jsonOrFallback<{ managers?: ClanManagerRow[] }>(res, {});
    return body.managers ?? [];
}
