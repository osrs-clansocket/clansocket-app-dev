import { jsonFetch } from "../../../shared/fetchers/json-fetcher.js";
import { sameOriginFetch } from "../../../shared/fetchers/same-origin-fetcher.js";
import { canMutateLinker, type LinkerGateResult } from "../../clan-vault-auth/util/can-mutate-linker.js";
import {
    toServerPayload,
    type ByoBotStatus,
    type LinkResult,
    type ReassignLinkerPayload,
    type ReassignLinkerResult,
    type VerifyPayload,
    type VerifyResult,
} from "./byo-bot-types.js";

export type {
    ByoBotStatus,
    LinkedStatus,
    LinkResult,
    PublicMetadata,
    ReassignLinkerPayload,
    ReassignLinkerResult,
    ServedGuild,
    UnlinkedStatus,
    VerifyPayload,
    VerifyResult,
    VerifyStatus,
} from "./byo-bot-types.js";

const VERIFY_PATH = "/verify";
const REASSIGN_PATH = "/reassign-linker";
const STREAM_PATH = "/stream";

function baseUrl(slug: string): string {
    return `/api/discord/byo-bot/${encodeURIComponent(slug)}`;
}

export async function verifyByoBot(slug: string, payload: VerifyPayload): Promise<VerifyResult> {
    const url = `${baseUrl(slug)}${VERIFY_PATH}`;
    const res = await jsonFetch(url, "POST", toServerPayload(payload));
    if (!res.ok) return { ok: false, reason: `http_${res.status}` };
    return (await res.json()) as VerifyResult;
}

export async function linkByoBot(slug: string, payload: VerifyPayload, guildId?: string): Promise<LinkResult> {
    const url = baseUrl(slug);
    const res = await jsonFetch(url, "POST", toServerPayload(payload, guildId));
    if (!res.ok) return { ok: false, reason: `http_${res.status}` };
    return (await res.json()) as LinkResult;
}

export async function bindToGuild(slug: string, guildId: string): Promise<boolean> {
    const url = `${baseUrl(slug)}/bind/${encodeURIComponent(guildId)}`;
    const res = await sameOriginFetch(url, { method: "POST" });
    return res.ok;
}

export async function unbindFromGuild(slug: string, guildId: string): Promise<boolean> {
    const url = `${baseUrl(slug)}/unbind/${encodeURIComponent(guildId)}`;
    const res = await sameOriginFetch(url, { method: "POST" });
    return res.ok;
}

export async function revokeByoBot(slug: string): Promise<boolean> {
    const res = await sameOriginFetch(baseUrl(slug), { method: "DELETE" });
    return res.ok;
}

export async function getStatus(slug: string): Promise<ByoBotStatus> {
    const res = await sameOriginFetch(baseUrl(slug), { method: "GET" });
    if (!res.ok) return { linked: false };
    return (await res.json()) as ByoBotStatus;
}

export function openStream(slug: string, onUpdate: () => void): () => void {
    const url = `${baseUrl(slug)}${STREAM_PATH}`;
    const source = new EventSource(url);
    source.addEventListener("message", onUpdate);
    return () => source.close();
}

export async function reassignLinker(slug: string, payload: ReassignLinkerPayload): Promise<ReassignLinkerResult> {
    const url = `${baseUrl(slug)}${REASSIGN_PATH}`;
    const res = await jsonFetch(url, "POST", { new_linker_user_id: payload.newLinkerUserId });
    if (!res.ok) return { ok: false, reason: `http_${res.status}` };
    return (await res.json()) as ReassignLinkerResult;
}

export async function verifyAndLink(slug: string, payload: VerifyPayload, guildId?: string): Promise<LinkResult> {
    const verify = await verifyByoBot(slug, payload);
    if (!verify.ok) return { ok: false, reason: verify.reason ?? "verify_failed" };
    return linkByoBot(slug, payload, guildId);
}

export function linkerGate(status: ByoBotStatus, currentUserId: string): LinkerGateResult {
    if (!status.linked) {
        return { canMutate: false, isOwnerOverride: false, canReassign: false };
    }
    return canMutateLinker(
        {
            linkerSiteAccountId: status.owner_site_account_id,
            clanOwnerSiteAccountId: status.clan_owner_site_account_id,
        },
        currentUserId,
    );
}
