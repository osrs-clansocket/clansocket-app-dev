import type { ClanAuditEntry } from "../clans-client/index.js";
import { tallySemantic } from "./format.js";

export interface AggregateStats {
    total: number;
    bySource: Record<string, number>;
    bySemantic: Record<string, number>;
    earliestTs: number | null;
    latestTs: number | null;
}

export function emptyStats(): AggregateStats {
    return { total: 0, bySource: {}, bySemantic: {}, earliestTs: null, latestTs: null };
}

export function updateStats(stats: AggregateStats, entry: ClanAuditEntry): void {
    stats.total += 1;
    stats.bySource[entry.source] = (stats.bySource[entry.source] ?? 0) + 1;
    const sem = tallySemantic(entry.action);
    stats.bySemantic[sem] = (stats.bySemantic[sem] ?? 0) + 1;
    if (stats.earliestTs === null || entry.ts < stats.earliestTs) stats.earliestTs = entry.ts;
    if (stats.latestTs === null || entry.ts > stats.latestTs) stats.latestTs = entry.ts;
}
