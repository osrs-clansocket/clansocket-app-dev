import type { ClanSummary, ManagedClan } from "../clans-client/index.js";

export function adaptClanSummary(s: ClanSummary): ManagedClan {
    return {
        id: s.id,
        slug: s.slug,
        displayName: s.displayName,
        status: s.status,
        role: "",
        grantedVia: "",
        grantedAt: 0,
        createdAt: s.createdAt,
        iconKind: null,
        iconValue: null,
        iconCustomized: false,
        iconTransform: null,
        iconVersion: 0,
        color: null,
        roster: s.roster,
    };
}
