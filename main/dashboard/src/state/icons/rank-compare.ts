export type RankComparator<T> = (a: T, b: T) => number;

function alphaRankCompare(a: string, b: string): number {
    return a.localeCompare(b);
}

export function compareRanks(
    a: string,
    b: string,
    rankByTitle: Map<string, number>,
    fallback: RankComparator<string> = alphaRankCompare,
): number {
    const ra = rankByTitle.get(a);
    const rb = rankByTitle.get(b);
    if (ra !== undefined && rb !== undefined) return rb - ra;
    if (ra !== undefined) return -1;
    if (rb !== undefined) return 1;
    return fallback(a, b);
}
