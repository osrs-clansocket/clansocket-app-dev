import logger from "@clansocket/logger";
import { dispatchSafe } from "../../database/plugin/projection/auto-hook-dispatcher.js";

export const TRIGGER_RUNEWATCH_SOFT_CLEARED = "runewatch_soft_cleared";

export interface RunewatchSoftCleared {
    clanId: string;
    rsn: string;
    source: string;
}

export function emitSoftCleared(clanId: string, memberName: string, source: string): void {
    const payload: RunewatchSoftCleared = { clanId, source, rsn: memberName };
    logger.debug(TRIGGER_RUNEWATCH_SOFT_CLEARED, payload as unknown as Record<string, unknown>);
    dispatchSafe({
        clanId,
        payload,
        triggerType: TRIGGER_RUNEWATCH_SOFT_CLEARED,
        rsn: memberName,
    });
}
