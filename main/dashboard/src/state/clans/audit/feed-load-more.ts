import type { ClusterRow } from "./cluster-defs.js";
import { pushDelta } from "./feed-delta.js";
import { foldFeedTail } from "./feed-fold.js";
import type { makeFetchPage } from "./feed-fetch.js";
import type { FeedState } from "./feed-types.js";

export async function loadFeedMore(args: {
    s: FeedState;
    fetchPage: ReturnType<typeof makeFetchPage>;
}): Promise<ClusterRow[]> {
    const { s, fetchPage } = args;
    if (!s.hasMoreFlagRef.v || s.nextBeforeRef.v === null) return [];
    const page = await fetchPage(s.nextBeforeRef.v);
    const originalLen = s.clusters.length;
    const tailBefore = s.clusters[originalLen - 1];
    const tailCountBefore = tailBefore?.count ?? 0;
    for (const entry of page.entries) {
        s.onEntry(entry);
        foldFeedTail(s, entry);
    }
    s.nextBeforeRef.v = page.nextBefore;
    s.hasMoreFlagRef.v = page.hasMore;
    if (tailBefore && tailBefore.count !== tailCountBefore) pushDelta(s, tailBefore);
    return s.clusters.slice(originalLen);
}
