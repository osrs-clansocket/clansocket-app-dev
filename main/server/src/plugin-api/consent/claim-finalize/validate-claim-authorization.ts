import { logPluginError } from "../../logger/index.js";
import type { DispatchContext } from "../../handlers/dispatch.js";
import { CLAIM_ELIGIBLE_RANKS_SET } from "../eligible-ranks.js";

export function validateClaimAuthorization(ctx: DispatchContext, clanId: string, requestId: number): boolean {
    const { state, sessionId } = ctx;
    if (state.sockClanId !== clanId) {
        logPluginError(sessionId, `claim_consent_response clan mismatch requestId=${requestId}`);
        return false;
    }
    const rank = state.latestClanRank ?? "";
    if (!CLAIM_ELIGIBLE_RANKS_SET.has(rank)) {
        logPluginError(sessionId, `claim_consent_response insufficient rank requestId=${requestId} rank=${rank}`);
        return false;
    }
    return true;
}
