import { sortRanks } from "../../../../state/icons/rank-sort.js";
import type { WhitelistData } from "../../../../state/clans/stores/whitelist-store.js";
import type { RankDataRef } from "./whitelist-buttons.js";

const TIER_OWNER = 0;
const TIER_DEPUTY = 1;
const TIER_WHITELISTED = 2;
const TIER_OTHER = 3;

export function computeSortedRanks(data: WhitelistData, dataRef: RankDataRef): string[] {
    const ranks = new Set<string>();
    for (const m of data.summary?.roster?.members ?? []) {
        if (m.rank && m.rank.length > 0) ranks.add(m.rank);
    }
    const tierOf = (r: string): number => {
        if (r === "Owner") return TIER_OWNER;
        if (r === "Deputy Owner") return TIER_DEPUTY;
        if (dataRef.activeByRank.has(r)) return TIER_WHITELISTED;
        return TIER_OTHER;
    };
    const fallback = (a: string, b: string): number => {
        const ta = tierOf(a);
        const tb = tierOf(b);
        return ta !== tb ? ta - tb : a.localeCompare(b);
    };
    return sortRanks([...ranks], data.ladder, fallback);
}
