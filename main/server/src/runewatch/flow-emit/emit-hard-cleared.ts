import logger from "@clansocket/logger";
import { dispatchSafe } from "../../database/plugin/projection/auto-hook-dispatcher.js";

export const TRIGGER_RUNEWATCH_HARD_CLEARED = "runewatch_hard_cleared";

export interface RunewatchHardCleared {
    clanId: string;
    rsn: string;
    hash: string;
}

export function emitHardCleared(clanId: string, memberName: string, hash: string): void {
    const payload: RunewatchHardCleared = { clanId, hash, rsn: memberName };
    logger.debug(TRIGGER_RUNEWATCH_HARD_CLEARED, payload as unknown as Record<string, unknown>);
    dispatchSafe({
        clanId,
        payload,
        triggerType: TRIGGER_RUNEWATCH_HARD_CLEARED,
        rsn: memberName,
    });
}
