import type { ClanAuditEntry } from "../clans-client/index.js";
import { clusterAdd, clusterMatches, makeClusterRow } from "./cluster-defs.js";
import { pushDelta } from "./feed-delta.js";
import type { FeedState } from "./feed-types.js";

export function foldFeedTail(s: FeedState, entry: ClanAuditEntry): void {
    const tail = s.clusters[s.clusters.length - 1];
    if (tail && clusterMatches(tail, entry)) {
        tail.count += clusterAdd(entry);
        tail.ids.push(entry.id);
        return;
    }
    s.clusters.push(makeClusterRow(entry));
}

export function ingestLive(s: FeedState, entry: ClanAuditEntry): void {
    if (s.clusters.some((c) => c.ids.includes(entry.id))) return;
    s.onEntry(entry);
    const head = s.clusters[0];
    if (head && clusterMatches(head, entry)) {
        head.head = entry;
        head.count += clusterAdd(entry);
        head.ids.unshift(entry.id);
        pushDelta(s, head);
        return;
    }
    const cluster = makeClusterRow(entry);
    s.clusters.unshift(cluster);
    pushDelta(s, cluster);
}
