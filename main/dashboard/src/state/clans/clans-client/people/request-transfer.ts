import { identityClient } from "../../../identity/identity-client/index.js";

export async function requestTransfer(
    slug: string,
): Promise<{ ok: true; slug: string; clanId: string } | { ok: false; reason: string; message?: string }> {
    const res = await identityClient.authedFetch(`/api/clans/${encodeURIComponent(slug)}/transfer-request`, {
        method: "POST",
    });
    const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        slug?: string;
        clanId?: string;
        reason?: string;
        message?: string;
    };
    if (res.ok && body.ok && body.slug && body.clanId) {
        return { ok: true, slug: body.slug, clanId: body.clanId };
    }
    return { ok: false, reason: body.reason ?? "generic", message: body.message };
}
