import { identityClient } from "../../../identity/identity-client/index.js";
import type { ManagerSubmitResult } from "./types.js";
import { successResult } from "./managed-result-builders.js";

export async function requestManaged(clanSlug: string, declaredRsn?: string): Promise<ManagerSubmitResult> {
    const res = await identityClient.authedFetch("/api/auth/site/request-management", {
        method: "POST",
        body: JSON.stringify({ clanSlug, declaredRsn }),
    });
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (res.ok && body.ok === true) return successResult(body);
    return {
        ok: false,
        reason: (body.reason as "bad_payload" | "clan_not_found" | "generic") ?? "generic",
        message: body.message as string | undefined,
    };
}
