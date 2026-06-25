import { identityClient } from "../../identity/identity-client/index.js";
import { jsonOrFallback } from "../../fetch-result.js";
import { sameOriginFetch } from "../../../shared/fetchers/same-origin-fetcher.js";
import type { ClanIconKind, IconTransform } from "./branding.js";
import type { RouteSeoData } from "../../../managers/router/types.js";

export interface ClanRosterMember {
    name: string;
    rank: string | null;
    joinedAt: string | null;
    hasPlugin?: boolean;
    isLive?: boolean;
}

export interface ManagedClanRoster {
    fingerprint: string;
    capturedAt: number;
    memberCount: number;
    members: ClanRosterMember[];
}

export interface ManagedClan {
    id: string;
    slug: string;
    displayName: string;
    status: string;
    role: string;
    grantedVia: string;
    grantedAt: number;
    createdAt: number;
    iconKind: ClanIconKind | null;
    iconValue: string | null;
    iconCustomized: boolean;
    iconTransform: IconTransform | null;
    iconVersion: number;
    color: string | null;
    roster: ManagedClanRoster | null;
}

export interface ClanSummary {
    id: string;
    slug: string;
    displayName: string;
    status: string;
    ownerAccountHash: string | null;
    createdAt: number;
    claimedAt: number | null;
    roster: {
        fingerprint: string;
        capturedAt: number;
        memberCount: number;
        members: ClanRosterMember[];
    } | null;
}

export interface ClanSearchHit {
    slug: string;
    displayName: string;
    iconKind: "builtin" | "image" | null;
    iconValue: string | null;
    color: string | null;
}

export interface ManagerStatus {
    isManager: boolean;
    clanId: string | null;
    slug: string;
}

export interface TitleLadderEntry {
    rank: number;
    title: string;
    titleId: number;
}

export async function listManaged(): Promise<ManagedClan[]> {
    const res = await identityClient.authedFetch("/api/clans/me");
    const body = await jsonOrFallback<{ clans?: ManagedClan[] }>(res, {});
    return body.clans ?? [];
}

export async function getClan(slug: string): Promise<ClanSummary | null> {
    const res = await sameOriginFetch(`/api/clans/${encodeURIComponent(slug)}`);
    return jsonOrFallback<ClanSummary | null>(res, null);
}

export async function checkManagerStatus(slug: string): Promise<ManagerStatus> {
    const res = await identityClient.authedFetch(`/api/clans/${encodeURIComponent(slug)}/manage/me`);
    return jsonOrFallback<ManagerStatus>(res, { isManager: false, clanId: null, slug });
}

export async function searchClans(query: string): Promise<ClanSearchHit[]> {
    const res = await identityClient.authedFetch(`/api/clans/search?q=${encodeURIComponent(query)}`, {
        method: "GET",
    });
    if (!res.ok) return [];
    const body = (await res.json().catch(() => ({}))) as { clans?: ClanSearchHit[] };
    return body.clans ?? [];
}

export async function listClanTitles(slug: string): Promise<TitleLadderEntry[]> {
    const res = await sameOriginFetch(`/api/clans/${encodeURIComponent(slug)}/clan-titles`);
    const body = await jsonOrFallback<{ entries?: TitleLadderEntry[] }>(res, {});
    return body.entries ?? [];
}

export async function removeClan(slug: string): Promise<boolean> {
    const res = await identityClient.authedFetch(`/api/clans/${encodeURIComponent(slug)}`, { method: "DELETE" });
    return res.ok;
}

export async function fetchClanSeo(slug: string): Promise<RouteSeoData | null> {
    const res = await sameOriginFetch(`/api/clans/${encodeURIComponent(slug)}/seo`);
    return jsonOrFallback<RouteSeoData | null>(res, null);
}

export interface ManageClanSeo {
    title: string | null;
    description: string | null;
    image: string | null;
    isPublic: boolean;
    displayName: string;
    publicToggledAt: number | null;
}

export interface SeoPatch {
    title?: string | null;
    description?: string | null;
    image?: string | null;
    isPublic?: boolean;
}

export async function fetchSeo(slug: string): Promise<ManageClanSeo | null> {
    const res = await identityClient.authedFetch(`/api/clans/${encodeURIComponent(slug)}/manage/seo`);
    return jsonOrFallback<ManageClanSeo | null>(res, null);
}

export async function updateClanSeo(slug: string, patch: SeoPatch): Promise<ManageClanSeo | null> {
    const res = await identityClient.authedJsonFetch(
        `/api/clans/${encodeURIComponent(slug)}/manage/seo`,
        "PATCH",
        patch,
        {},
    );
    return jsonOrFallback<ManageClanSeo | null>(res, null);
}
