import type { ClanRankLadder } from "./rank-ladder-cache.js";
import { compareRanks } from "./rank-compare.js";
import { valueByTitle } from "./rank-value-title.js";

export interface MemberLike {
    rank: string | null;
}

export function sortMembers<T extends MemberLike>(
    members: readonly T[],
    ladder: ClanRankLadder,
    nameKey: (m: T) => string,
): T[] {
    const map = valueByTitle(ladder);
    return [...members].sort((a, b) => {
        const ra = a.rank ?? "";
        const rb = b.rank ?? "";
        const cmp = compareRanks(ra, rb, map);
        if (cmp !== 0) return cmp;
        return nameKey(a).localeCompare(nameKey(b));
    });
}
