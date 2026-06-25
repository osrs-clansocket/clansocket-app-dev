import type { RunewatchCaseRow } from "../../database/site/runewatch/lookup-by-rsn.js";

const MAX_EVIDENCE_RATING = 5;

function caseDetails(hardCase: RunewatchCaseRow): string {
    const hash = hardCase.hash ?? "unknown";
    const rating = hardCase.evidence_rating ?? MAX_EVIDENCE_RATING;
    return `${hash}, ${hardCase.reason}, evidence ${rating}/${MAX_EVIDENCE_RATING}`;
}

export function runewatchRefusalMessage(hardCase: RunewatchCaseRow): string {
    return `Please return the items you stole to the rightful owner. (runewatch case ${caseDetails(hardCase)})`;
}

export function runewatchSubmissionRefusal(hardCase: RunewatchCaseRow): string {
    return `This RSN is on RuneWatch's hard list. Resolve your case before using ClanSocket.\n(case ${caseDetails(hardCase)})`;
}
