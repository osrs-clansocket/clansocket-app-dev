import { bootstrapFeed } from "./feed-bootstrap.js";
import type { makeFetchPage } from "./feed-fetch.js";
import type { AuditFeed, AuditFeedOptions, FeedState } from "./feed-types.js";

export function subscribeAuditSource(args: {
    opts: AuditFeedOptions;
    s: FeedState;
    fetchPage: ReturnType<typeof makeFetchPage>;
    onSnapshot: Parameters<AuditFeed["source"]["subscribe"]>[0];
    onDelta: Parameters<AuditFeed["source"]["subscribe"]>[1];
}): () => void {
    const { opts, s, fetchPage, onSnapshot, onDelta } = args;
    s.emitDeltaRef.v = onDelta;
    const closedRef = { v: false };
    const streamCloseRef: { v: (() => void) | null } = { v: null };
    void bootstrapFeed({ opts, s, fetchPage, onSnapshot, closedRef }).then((close) => {
        streamCloseRef.v = close;
    });
    return () => {
        closedRef.v = true;
        streamCloseRef.v?.();
        s.emitDeltaRef.v = null;
    };
}
