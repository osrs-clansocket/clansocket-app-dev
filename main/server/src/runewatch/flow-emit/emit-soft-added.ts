import logger from "@clansocket/logger";
import { dispatchSafe } from "../../database/plugin/projection/auto-hook-dispatcher.js";
import type { RunewatchCaseRow } from "../../database/site/runewatch/lookup-by-rsn.js";

export const TRIGGER_RUNEWATCH_SOFT_ADDED = "runewatch_soft_added";

export interface RunewatchSoftAdded {
    clanId: string;
    rsn: string;
    reason: string;
    source: string;
}

export function emitSoftAdded(clanId: string, memberName: string, softCase: RunewatchCaseRow): void {
    const payload: RunewatchSoftAdded = {
        clanId,
        rsn: memberName,
        reason: softCase.reason,
        source: softCase.source,
    };
    logger.debug(TRIGGER_RUNEWATCH_SOFT_ADDED, payload as unknown as Record<string, unknown>);
    dispatchSafe({
        clanId,
        payload,
        triggerType: TRIGGER_RUNEWATCH_SOFT_ADDED,
        rsn: memberName,
    });
}
