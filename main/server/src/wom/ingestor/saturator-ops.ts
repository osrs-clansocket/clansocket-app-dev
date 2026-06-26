import { parseIsoMs } from "../../shared/time/index.js";

const CLUE_PREFIX = "clue_scrolls_";

export function extractClueTier(metric: string): string | null {
    if (!metric.startsWith(CLUE_PREFIX)) return null;
    return metric.substring(CLUE_PREFIX.length);
}

export function playerChangedMs(player: { lastChangedAt?: string | null; updatedAt?: string | null }): number {
    return parseIsoMs(player.lastChangedAt) || parseIsoMs(player.updatedAt);
}
