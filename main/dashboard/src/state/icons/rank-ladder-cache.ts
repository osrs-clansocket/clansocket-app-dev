import { AsyncMemoCache } from "../caches/async-memo-cache.js";
import { clansClient, type TitleLadderEntry } from "../clans/clans-client/index.js";

export type ClanRankLadder = readonly TitleLadderEntry[];

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const ladderCache = new AsyncMemoCache<string, ClanRankLadder>({
    tag: "clan-state",
    maxEntries: 32,
    ttlMs: FIVE_MINUTES_MS,
});

export function fetchLadder(slug: string): Promise<ClanRankLadder> {
    return ladderCache.getOrLoad(slug, async () => {
        const entries = await clansClient.listClanTitles(slug);
        return entries as ClanRankLadder;
    });
}

export function invalidateLadder(slug: string): void {
    ladderCache.delete(slug);
}
