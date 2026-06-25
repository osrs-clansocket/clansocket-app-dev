import type { DeltaBatch } from "@clansocket/realtime";
import type { LiveSource } from "../../../dom/factory/live-ops";
import type { ClanAuditEntry } from "../clans-client/index.js";
import type { ClusterFilters, ClusterRow } from "./cluster-defs.js";

export const FEED_TOPIC = "clan-audit";

export interface AuditFeed {
    source: LiveSource;
    loadFeedMore: () => Promise<ClusterRow[]>;
    hasMore: () => boolean;
}

export interface AuditFeedOptions {
    slug: string;
    filters: ClusterFilters;
    limit: number;
    onEntry: (entry: ClanAuditEntry) => void;
    onLoaded: () => void;
}

export interface FeedState {
    clusters: ClusterRow[];
    seqRef: { v: number };
    nextBeforeRef: { v: number | null };
    hasMoreFlagRef: { v: boolean };
    emitDeltaRef: { v: ((batch: DeltaBatch) => void) | null };
    onEntry: (entry: ClanAuditEntry) => void;
}

export function freshFeedState(onEntry: (e: ClanAuditEntry) => void): FeedState {
    return {
        clusters: [],
        seqRef: { v: 0 },
        nextBeforeRef: { v: null },
        hasMoreFlagRef: { v: false },
        emitDeltaRef: { v: null },
        onEntry,
    };
}
