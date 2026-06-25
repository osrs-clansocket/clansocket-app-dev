import { normalizeRsn } from "../../database/clans/access/clan-roster/lookups.js";
import { runewatchSubmissionRefusal } from "../messages/build-refusal-message.js";
import { syncRunewatchCases } from "../sync/sync-cases.js";
import { RUNEWATCH_BLOCKED_REASON, checkRunewatchBlock, isHardBlock } from "./check-block-gate.js";

export type RsnSubmissionGate = { ok: true } | { ok: false; reason: typeof RUNEWATCH_BLOCKED_REASON; message: string };

export async function gateRsnSubmission(rsn: string): Promise<RsnSubmissionGate> {
    await syncRunewatchCases({ forceBypassCooldown: true });
    const block = checkRunewatchBlock(normalizeRsn(rsn));
    if (isHardBlock(block)) {
        return {
            ok: false,
            reason: RUNEWATCH_BLOCKED_REASON,
            message: runewatchSubmissionRefusal(block.case),
        };
    }
    return { ok: true };
}
