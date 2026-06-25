import { identityClient } from "../../../identity/identity-client/index.js";
import { jsonOrFallback } from "../../../fetch-result.js";
import type { ManagerRequest } from "./types.js";

export async function listManagerRequests(slug: string): Promise<ManagerRequest[]> {
    const res = await identityClient.authedFetch(`/api/clans/${encodeURIComponent(slug)}/manager-requests`);
    const body = await jsonOrFallback<{ requests?: ManagerRequest[] }>(res, {});
    return body.requests ?? [];
}
