import logger from "@clansocket/logger";
import { isPlainObject } from "../../shared/validators/type-guards.js";

export interface RunewatchUpstreamRow {
    accused_rsn: string;
    published_date: string;
    reason: string;
    evidence_rating: number | string;
    quick_find: string;
    source: string;
    hash: string;
}

function coerceUpstreamRow(raw: Record<string, unknown>): RunewatchUpstreamRow {
    const str = (v: unknown): string => (typeof v === "string" ? v : "");
    const evidence = (v: unknown): number | string => (typeof v === "number" || typeof v === "string" ? v : "");
    return {
        accused_rsn: str(raw.accused_rsn),
        published_date: str(raw.published_date),
        reason: str(raw.reason),
        evidence_rating: evidence(raw.evidence_rating),
        quick_find: str(raw.quick_find),
        source: str(raw.source),
        hash: str(raw.hash),
    };
}

export function projectRows(parsed: unknown[]): RunewatchUpstreamRow[] {
    const rows: RunewatchUpstreamRow[] = [];
    let invalidCount = 0;
    const isValid = (raw: Record<string, unknown>): boolean =>
        typeof raw.accused_rsn === "string" &&
        raw.accused_rsn.length > 0 &&
        typeof raw.source === "string" &&
        raw.source.length > 0;
    for (const item of parsed) {
        if (isPlainObject(item) && isValid(item)) rows.push(coerceUpstreamRow(item));
        else invalidCount += 1;
    }
    if (invalidCount > 0) logger.warn(`runewatch fetch skipped ${invalidCount} malformed rows`);
    return rows;
}
