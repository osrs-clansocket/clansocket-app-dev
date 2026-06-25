import type { SiteRsnRow } from "../../../database/site/rsn/state.js";
import type { ConsentRequestRow } from "../../../database/site/consent/types.js";
import { placeholderFromHash, RSN_DISPLACED_CLEANUP_MS } from "../../../database/index.js";

export function shapeVerifiedRsn(r: SiteRsnRow) {
    const displaced = r.rsn === placeholderFromHash(r.account_hash);
    return {
        displaced,
        accountHash: r.account_hash,
        rsn: r.rsn,
        source: r.source,
        verifiedAt: r.verified_at,
        displacementDeadlineAt: displaced ? r.account_last_active + RSN_DISPLACED_CLEANUP_MS : null,
        rank: r.current_rank,
    };
}

export interface RsnRequestView {
    id: number;
    targetRsn: string;
    createdAt: number;
    expiresAt: number;
}

export function rsnRequestView(id: number, targetRsn: string, createdAt: number, expiresAt: number): RsnRequestView {
    return { id, targetRsn, createdAt, expiresAt };
}

export function shapeRsnRequest(r: ConsentRequestRow): RsnRequestView {
    return rsnRequestView(r.id, r.target_rsn, r.created_at, r.expires_at);
}

export function shapeClaimConsent(r: ConsentRequestRow) {
    return {
        ...rsnRequestView(r.id, r.target_rsn, r.created_at, r.expires_at),
        declaredClanName: r.declared_clan_name ?? "",
    };
}
