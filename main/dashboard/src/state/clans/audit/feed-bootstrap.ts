import { clansClient } from "../clans-client/index.js";
import { matchesClusterFilters } from "./cluster-defs.js";
import { foldFeedTail, ingestLive } from "./feed-fold.js";
import type { makeFetchPage } from "./feed-fetch.js";
import { FEED_TOPIC, type AuditFeed, type AuditFeedOptions, type FeedState } from "./feed-types.js";

export async function bootstrapFeed(args: {
    opts: AuditFeedOptions;
    s: FeedState;
    fetchPage: ReturnType<typeof makeFetchPage>;
    onSnapshot: Parameters<AuditFeed["source"]["subscribe"]>[0];
    closedRef: { v: boolean };
}): Promise<(() => void) | null> {
    const { opts, s, fetchPage, onSnapshot, closedRef } = args;
    const page = await fetchPage(undefined);
    if (closedRef.v) return null;
    for (const entry of page.entries) {
        s.onEntry(entry);
        foldFeedTail(s, entry);
    }
    s.nextBeforeRef.v = page.nextBefore;
    s.hasMoreFlagRef.v = page.hasMore;
    onSnapshot({ topic: FEED_TOPIC, seq: 0, rows: s.clusters.slice() });
    opts.onLoaded();
    return clansClient.openAuditStream(opts.slug, (entry) => {
        if (matchesClusterFilters(entry, opts.filters)) ingestLive(s, entry);
    });
}
