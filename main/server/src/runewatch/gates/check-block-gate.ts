import { casesByRsn, type RunewatchCaseRow } from "../../database/site/runewatch/lookup-by-rsn.js";

const FIRST_INDEX = 0;

export const RUNEWATCH_BLOCKED_REASON = "runewatch_blocked";

export type RunewatchBlockResult =
    | { blocked: "hard"; case: RunewatchCaseRow }
    | { blocked: "soft"; cases: RunewatchCaseRow[] }
    | { blocked: false };

export function isHardBlock(result: RunewatchBlockResult): result is { blocked: "hard"; case: RunewatchCaseRow } {
    return result.blocked === "hard";
}

export function checkRunewatchBlock(rsnNormalized: string): RunewatchBlockResult {
    const rows = casesByRsn(rsnNormalized);
    if (rows.length === 0) return { blocked: false };
    const byTier = (tier: string): RunewatchCaseRow[] => rows.filter((r) => r.tier === tier);
    const hards = byTier("hard");
    if (hards.length > 0) return { blocked: "hard", case: hards[FIRST_INDEX] };
    const softs = byTier("soft");
    if (softs.length > 0) return { blocked: "soft", cases: softs };
    return { blocked: false };
}
