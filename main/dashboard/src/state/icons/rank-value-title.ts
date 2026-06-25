import { WeakRefCache } from "../caches/weak-ref-cache.js";
import type { ClanRankLadder } from "./rank-ladder-cache.js";

const valueByTitleCache = new WeakRefCache<object, Map<string, number>>({ tag: "clan-state" });

export function valueByTitle(ladder: ClanRankLadder): Map<string, number> {
    const key = ladder as unknown as object;
    const cached = valueByTitleCache.get(key);
    if (cached !== undefined) return cached;
    const out = new Map<string, number>();
    for (const t of ladder) out.set(t.title, t.rank);
    valueByTitleCache.set(key, out);
    return out;
}
