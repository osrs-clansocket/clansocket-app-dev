import type { RunewatchTier } from "../../database/site/runewatch/lookup-by-rsn.js";
import type { RunewatchUpstreamRow } from "../client/fetch-client.js";
import { parseEvidenceRating } from "./parse-evidence.js";

const EMPTY = "";

export interface ExtractedFields {
    tier: RunewatchTier;
    hash: string | null;
    evidence: number | null;
    publishedAt: number | null;
}

export function extractFields(u: RunewatchUpstreamRow): ExtractedFields {
    const tier: RunewatchTier = u.hash !== EMPTY ? "hard" : "soft";
    const hash = u.hash !== EMPTY ? u.hash : null;
    const evidenceNum = parseEvidenceRating(u.evidence_rating);
    const evidence = Number.isFinite(evidenceNum) ? evidenceNum : null;
    const publishedMs = u.published_date === EMPTY ? NaN : Date.parse(u.published_date.replace(" ", "T") + "Z");
    const publishedAt = Number.isFinite(publishedMs) ? publishedMs : null;
    return { tier, hash, evidence, publishedAt };
}
