import { makeFetchPage } from "./feed-fetch.js";
import { loadFeedMore } from "./feed-load-more.js";
import { subscribeAuditSource } from "./feed-subscribe.js";
import { freshFeedState, type AuditFeed, type AuditFeedOptions } from "./feed-types.js";

export type { AuditFeed, AuditFeedOptions } from "./feed-types.js";

export function createAuditFeed(opts: AuditFeedOptions): AuditFeed {
    const s = freshFeedState(opts.onEntry);
    const fetchPage = makeFetchPage(opts.slug, opts.filters, opts.limit);
    return {
        hasMore: () => s.hasMoreFlagRef.v,
        loadFeedMore: () => loadFeedMore({ s, fetchPage }),
        source: {
            subscribe: (onSnapshot, onDelta) => subscribeAuditSource({ opts, s, fetchPage, onSnapshot, onDelta }),
        },
    };
}
