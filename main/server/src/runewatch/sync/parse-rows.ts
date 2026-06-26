import { normalizeRsn } from "../../database/clans/access/clan-roster/lookups.js";

import type { RunewatchCaseRow, RunewatchSource } from "../../database/site/runewatch/lookup-by-rsn.js";
import type { RunewatchUpstreamRow } from "../client/fetch-client.js";
import { deriveKey } from "./derive-case-key.js";
import { extractFields } from "./extract-fields.js";

const EMPTY = "";
const RW = "RW";
const WDR = "WDR";

const KNOWN_SOURCES = new Set<RunewatchSource>([RW, WDR]);

function toSource(s: string): RunewatchSource | null {
    return KNOWN_SOURCES.has(s as RunewatchSource) ? (s as RunewatchSource) : null;
}

function tryParseRow(u: RunewatchUpstreamRow, now: number): RunewatchCaseRow | null {
    const source = toSource(u.source);
    if (!source) return null;
    const fields = extractFields(u);
    if (fields.tier === "hard" && (fields.hash === null || fields.evidence === null || fields.publishedAt === null))
        return null;
    const rsnNormalized = normalizeRsn(u.accused_rsn);
    return {
        source,
        hash: fields.hash,
        tier: fields.tier,
        case_key: deriveKey(u, rsnNormalized),
        accused_rsn: u.accused_rsn,
        rsn_normalized: rsnNormalized,
        reason: u.reason,
        evidence_rating: fields.evidence,
        quick_find: u.quick_find !== EMPTY ? u.quick_find : null,
        published_at: fields.publishedAt,
        synced_at: now,
    };
}

export function parseRunewatchRows(upstream: RunewatchUpstreamRow[], now: number): RunewatchCaseRow[] {
    const rows: RunewatchCaseRow[] = [];
    for (const u of upstream) {
        const row = tryParseRow(u, now);
        if (row !== null) rows.push(row);
    }
    return rows;
}
