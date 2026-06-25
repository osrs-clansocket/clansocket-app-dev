import { identityClient } from "../../state/identity/identity-client/index.js";

interface PinnedResponse {
    pinned: string[];
}

async function readPinned(path: string, init?: RequestInit): Promise<string[]> {
    const res = await identityClient.authedFetch(path, init);
    if (!res.ok) return [];
    const body = (await res.json()) as PinnedResponse;
    return body.pinned;
}

async function fetchPinnedContext(): Promise<string[]> {
    return readPinned("/api/ai/chat/context");
}

async function unpinPinnedIds(ids: string[]): Promise<string[]> {
    return readPinned("/api/ai/chat/context/unpin", {
        method: "POST",
        body: JSON.stringify({ ids }),
    });
}

export { fetchPinnedContext, unpinPinnedIds };
