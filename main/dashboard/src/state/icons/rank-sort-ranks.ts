import type { ClanRankLadder } from "./rank-ladder-cache.js";
import { compareRanks, type RankComparator } from "./rank-compare.js";
import { valueByTitle } from "./rank-value-title.js";

export function sortRanks(
    ranks: readonly string[],
    ladder: ClanRankLadder,
    fallback?: RankComparator<string>,
): string[] {
    const map = valueByTitle(ladder);
    return [...ranks].sort((a, b) => compareRanks(a, b, map, fallback));
}
