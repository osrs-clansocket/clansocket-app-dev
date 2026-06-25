export type WomVerifyStatus = "ok" | "auth-failed" | "rate-limited" | "unreachable";

export interface WomPublicMetadata {
    groupId: number;
    groupName: string;
}

export interface WomLinkedStatus {
    linked: true;
    linker_site_account_id: string;
    linker_rsn: string | null;
    linker_rank: string | null;
    wom_group_id: number;
    cached_group_name: string;
    last_verified_at: number | null;
    last_verified_status: WomVerifyStatus | null;
    last_backfill_at: number | null;
    last_backfill_status: string | null;
    next_backfill_eligible_at: number | null;
}

export interface WomUnlinkedStatus {
    linked: false;
}

export type WomStatus = WomLinkedStatus | WomUnlinkedStatus;

export interface WomVerifyPayload {
    groupId: number;
    verificationCode: string;
    apiKey?: string;
    userAgent?: string;
}

export interface WomVerifyResult {
    ok: boolean;
    public_metadata?: WomPublicMetadata;
    reason?: string;
}

export interface WomLinkResult {
    ok: boolean;
    linked?: { group_id: number; group_name: string; linker_site_account_id: string };
    reason?: string;
}

export interface WomReassignResult {
    ok: boolean;
    new_linker?: { user_id: string; display_name: string };
    reason?: string;
}

export interface SyncResult {
    ok: boolean;
    reason?: string;
    next_eligible_at?: number;
    enqueued?: number;
}

export interface WomGroupPlayer {
    id: number;
    username: string;
    displayName: string;
    type: string;
    country: string | null;
    exp: number;
    ehp: number;
    ehb: number;
    ttm: number;
    updatedAt: string;
}

export interface WomGroupMembership {
    playerId: number;
    role: string | null;
    createdAt: string;
    updatedAt: string;
    player: WomGroupPlayer;
}

export interface WomGroupDetails {
    id: number;
    name: string;
    clanChat: string;
    description: string | null;
    homeworld: number | null;
    verified: boolean;
    patron: boolean;
    score: number;
    memberCount: number;
    createdAt: string;
    updatedAt: string;
    memberships: WomGroupMembership[];
}

export interface WomServerPayload {
    group_id: number;
    verification_code: string;
    api_key?: string;
    user_agent?: string;
}

export function toServerPayload(p: WomVerifyPayload): WomServerPayload {
    const out: WomServerPayload = { group_id: p.groupId, verification_code: p.verificationCode };
    if (p.apiKey !== undefined && p.apiKey.length > 0) out.api_key = p.apiKey;
    if (p.userAgent !== undefined && p.userAgent.length > 0) out.user_agent = p.userAgent;
    return out;
}
