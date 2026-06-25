import { identityClient } from "../../identity/identity-client/index.js";
import { jsonOrFallback } from "../../fetch-result.js";
import type { UserDataStats } from "./types.js";

export async function getDataStats(): Promise<UserDataStats | null> {
    const res = await identityClient.authedFetch("/api/data-rights/me/stats", { method: "GET" });
    return jsonOrFallback<UserDataStats | null>(res, null);
}
