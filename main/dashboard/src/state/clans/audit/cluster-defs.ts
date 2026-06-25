import type { ClanAuditEntry } from "../clans-client/index.js";
import { KIND_FILTERS, RANGE_FILTERS } from "./filter-defs.js";

export interface ClusterRow extends Record<string, unknown> {
    key: string;
    head: ClanAuditEntry;
    count: number;
    ids: number[];
    isClusterable: boolean;
}

export function isClusterAction(action: string): boolean {
    return action.startsWith("server:read.") || action.startsWith("client:");
}

export function clusterMatches(cluster: ClusterRow, entry: ClanAuditEntry): boolean {
    if (!cluster.isClusterable) return false;
    if (!isClusterAction(entry.action)) return false;
    if (cluster.head.action !== entry.action) return false;
    return (cluster.head.actorSiteAccountId ?? null) === (entry.actorSiteAccountId ?? null);
}

export function clusterAdd(entry: ClanAuditEntry): number {
    if (entry.action.startsWith("client:")) {
        const c = entry.payload?.count;
        if (typeof c === "number" && c > 0) return c;
    }
    return 1;
}

export function makeClusterRow(entry: ClanAuditEntry): ClusterRow {
    return {
        key: `cl-${entry.id}`,
        head: entry,
        count: clusterAdd(entry),
        ids: [entry.id],
        isClusterable: isClusterAction(entry.action),
    };
}

export interface ClusterFilters {
    kindPrefix: string | null;
    kindExclude: string | null;
    afterTs: number;
}

export function currentFilters(activeKind: string, activeRange: string): ClusterFilters {
    const kf = KIND_FILTERS.find((f) => f.key === activeKind) ?? KIND_FILTERS[0]!;
    const rf = RANGE_FILTERS.find((f) => f.key === activeRange) ?? RANGE_FILTERS[0]!;
    const afterTs = rf.sinceMs === null ? 0 : Date.now() - rf.sinceMs;
    return { kindPrefix: kf.prefix, kindExclude: kf.exclude, afterTs };
}

export function matchesClusterFilters(entry: ClanAuditEntry, filters: ClusterFilters): boolean {
    if (filters.kindPrefix !== null && !entry.action.startsWith(filters.kindPrefix)) return false;
    if (filters.kindExclude !== null && entry.action.startsWith(filters.kindExclude)) return false;
    return entry.ts >= filters.afterTs;
}
