import logger from "@clansocket/logger";
import { dispatchSafe } from "../../database/plugin/projection/auto-hook-dispatcher.js";
import type { RunewatchCaseRow } from "../../database/site/runewatch/lookup-by-rsn.js";

export const TRIGGER_RUNEWATCH_HARD_ADDED = "runewatch_hard_added";

export interface RunewatchHardAdded {
    clanId: string;
    rsn: string;
    hash: string;
    reason: string;
    evidence_rating: number;
    source: string;
    published_at: number;
}

export function emitHardAdded(clanId: string, memberName: string, hardCase: RunewatchCaseRow): void {
    const payload: RunewatchHardAdded = {
        clanId,
        rsn: memberName,
        hash: hardCase.hash ?? "",
        reason: hardCase.reason,
        evidence_rating: hardCase.evidence_rating ?? 0,
        source: hardCase.source,
        published_at: hardCase.published_at ?? 0,
    };
    logger.debug(TRIGGER_RUNEWATCH_HARD_ADDED, payload as unknown as Record<string, unknown>);
    dispatchSafe({
        clanId,
        payload,
        triggerType: TRIGGER_RUNEWATCH_HARD_ADDED,
        rsn: memberName,
    });
}
