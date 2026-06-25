import { identityClient } from "../../identity/identity-client/index.js";
import { jsonOrFallback } from "../../fetch-result.js";

export type RunewatchTier = "hard" | "soft";

export interface RunewatchCase {
    case_key: string;
    hash: string | null;
    tier: RunewatchTier;
    accused_rsn: string;
    rsn_normalized: string;
    reason: string;
    evidence_rating: number | null;
    source: string;
    quick_find: string | null;
    published_at: number | null;
    synced_at: number;
}

export interface FlaggedMember {
    member_name: string;
    rsn_normalized: string;
    cases: RunewatchCase[];
}

export interface RunewatchCooldownState {
    lastFetchAt: number;
    lastFetchStatus: string;
    lastHardCount: number;
    lastSoftCount: number;
    lastCaseCount: number;
    cooldownRemainingMs: number;
}

export interface RunewatchRefreshResult {
    ok: boolean;
    reason?: string;
    inserted?: number;
    updated?: number;
    deleted?: number;
    hardCount?: number;
    softCount?: number;
    cooldownRemainingMs?: number;
}

const RUNEWATCH_BASE = "/api/runewatch";

function url(slug: string, suffix: string): string {
    return `${RUNEWATCH_BASE}/${encodeURIComponent(slug)}/${suffix}`;
}

export async function listFlagged(slug: string): Promise<FlaggedMember[]> {
    const res = await identityClient.authedFetch(url(slug, "flagged"));
    const body = await jsonOrFallback<{ flagged?: FlaggedMember[] }>(res, {});
    return body.flagged ?? [];
}

export async function listCases(slug: string, q?: string, tier?: RunewatchTier): Promise<RunewatchCase[]> {
    const params: string[] = [];
    if (q) params.push(`q=${encodeURIComponent(q)}`);
    if (tier) params.push(`tier=${encodeURIComponent(tier)}`);
    const suffix = params.length > 0 ? `cases?${params.join("&")}` : "cases";
    const res = await identityClient.authedFetch(url(slug, suffix));
    const body = await jsonOrFallback<{ cases?: RunewatchCase[] }>(res, {});
    return body.cases ?? [];
}

export async function getCooldown(slug: string): Promise<RunewatchCooldownState | null> {
    const res = await identityClient.authedFetch(url(slug, "cooldown"));
    return jsonOrFallback<RunewatchCooldownState | null>(res, null);
}

export async function postRefresh(slug: string): Promise<RunewatchRefreshResult> {
    const res = await identityClient.authedFetch(url(slug, "refresh"), { method: "POST" });
    return jsonOrFallback<RunewatchRefreshResult>(res, { ok: false });
}
