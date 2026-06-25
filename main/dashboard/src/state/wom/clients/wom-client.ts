import { jsonFetch } from "../../../shared/fetchers/json-fetcher.js";
import { sameOriginFetch } from "../../../shared/fetchers/same-origin-fetcher.js";
import { toServerPayload } from "./wom-client-types.js";
import type {
    SyncResult,
    WomGroupDetails,
    WomLinkResult,
    WomReassignResult,
    WomStatus,
    WomVerifyPayload,
    WomVerifyResult,
} from "./wom-client-types.js";
export type {
    SyncResult,
    WomGroupDetails,
    WomGroupMembership,
    WomGroupPlayer,
    WomLinkResult,
    WomLinkedStatus,
    WomPublicMetadata,
    WomReassignResult,
    WomStatus,
    WomUnlinkedStatus,
    WomVerifyPayload,
    WomVerifyResult,
    WomVerifyStatus,
} from "./wom-client-types.js";

const HTTP_CONFLICT = 409;

function baseUrl(slug: string): string {
    return `/api/wom/${encodeURIComponent(slug)}`;
}

export async function verifyWom(slug: string, payload: WomVerifyPayload): Promise<WomVerifyResult> {
    const res = await jsonFetch(`${baseUrl(slug)}/verify`, "POST", toServerPayload(payload));
    if (!res.ok) return { ok: false, reason: `http_${res.status}` };
    return (await res.json()) as WomVerifyResult;
}

export async function linkWom(slug: string, payload: WomVerifyPayload): Promise<WomLinkResult> {
    const res = await jsonFetch(baseUrl(slug), "POST", toServerPayload(payload));
    if (!res.ok) return { ok: false, reason: `http_${res.status}` };
    return (await res.json()) as WomLinkResult;
}

export async function revokeWom(slug: string): Promise<{ ok: boolean; reason?: string }> {
    const res = await sameOriginFetch(baseUrl(slug), { method: "DELETE" });
    if (!res.ok) return { ok: false, reason: `http_${res.status}` };
    return (await res.json()) as { ok: boolean };
}

export async function reassignWomLinker(
    slug: string,
    payload: { newLinkerUserId: string },
): Promise<WomReassignResult> {
    const res = await jsonFetch(`${baseUrl(slug)}/reassign-linker`, "POST", {
        new_linker_user_id: payload.newLinkerUserId,
    });
    if (!res.ok) return { ok: false, reason: `http_${res.status}` };
    return (await res.json()) as WomReassignResult;
}

export async function syncWomNow(slug: string): Promise<SyncResult> {
    const res = await sameOriginFetch(`${baseUrl(slug)}/sync-now`, { method: "POST" });
    if (!res.ok && res.status !== HTTP_CONFLICT) return { ok: false, reason: `http_${res.status}` };
    return (await res.json()) as SyncResult;
}

export async function updateWomNow(slug: string): Promise<{ ok: boolean; reason?: string }> {
    const res = await sameOriginFetch(`${baseUrl(slug)}/update-now`, { method: "POST" });
    if (!res.ok) return { ok: false, reason: `http_${res.status}` };
    return (await res.json()) as { ok: boolean };
}

export async function getWomStatus(slug: string): Promise<WomStatus> {
    const res = await sameOriginFetch(baseUrl(slug), { method: "GET" });
    if (!res.ok) return { linked: false };
    return (await res.json()) as WomStatus;
}

export async function getGroupDetails(slug: string): Promise<WomGroupDetails | null> {
    const res = await sameOriginFetch(`${baseUrl(slug)}/details`, { method: "GET" });
    if (!res.ok) return null;
    return (await res.json()) as WomGroupDetails;
}

export function openWomStream(slug: string, onMessage: () => void): () => void {
    const url = `${baseUrl(slug)}/stream`;
    const source = new EventSource(url, { withCredentials: true });
    source.addEventListener("wom", () => onMessage());
    source.addEventListener("error", () => {});
    return () => source.close();
}
