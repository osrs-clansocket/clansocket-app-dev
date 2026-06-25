import type { RowDelta } from "@clansocket/realtime";
import type { ClusterRow } from "./cluster-defs.js";
import { FEED_TOPIC, type FeedState } from "./feed-types.js";

export function pushDelta(s: FeedState, row: ClusterRow): void {
    s.seqRef.v += 1;
    const delta: RowDelta = { topic: FEED_TOPIC, seq: s.seqRef.v, key: row.key, op: "upsert", row };
    s.emitDeltaRef.v?.({ topic: FEED_TOPIC, fromSeq: s.seqRef.v, toSeq: s.seqRef.v, deltas: [delta] });
}
