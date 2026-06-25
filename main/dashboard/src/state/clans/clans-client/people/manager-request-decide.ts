import { identityClient } from "../../../identity/identity-client/index.js";

export async function approveManagerRequest(slug: string, id: string): Promise<boolean> {
    const res = await identityClient.authedFetch(
        `/api/clans/${encodeURIComponent(slug)}/manager-requests/${encodeURIComponent(id)}/approve`,
        { method: "POST" },
    );
    return res.ok;
}

export async function denyManagerRequest(slug: string, id: string): Promise<boolean> {
    const res = await identityClient.authedFetch(
        `/api/clans/${encodeURIComponent(slug)}/manager-requests/${encodeURIComponent(id)}/deny`,
        { method: "POST" },
    );
    return res.ok;
}
