import { consentById } from "../../../database/index.js";
import { CONSENT_PENDING } from "../../../database/site/consent/types.js";
import { logPluginError } from "../../logger/index.js";
import type { DispatchContext } from "../../handlers/dispatch-types.js";
import { rsnMatchesConsent } from "../eligible-ranks.js";

export type ClaimConsent = NonNullable<ReturnType<typeof consentById>>;

export interface ClaimConsentValidated {
    declaredClanName: string;
    sessionAccount: string;
    sessionRsn: string;
}

export function validateClaimConsent(
    ctx: DispatchContext,
    consent: ClaimConsent,
    requestId: number,
): ClaimConsentValidated | null {
    const { state, sessionId } = ctx;
    if (consent.status !== CONSENT_PENDING) {
        logPluginError(sessionId, `claim_consent_response stale requestId=${requestId} status=${consent.status}`);
        return null;
    }
    if (!rsnMatchesConsent(state, consent) || !state.sessionAccount || !state.sessionRsn) {
        logPluginError(sessionId, `claim_consent_response rsn mismatch requestId=${requestId}`);
        return null;
    }
    const declaredClanName = (consent.declared_clan_name ?? "").trim();
    if (!declaredClanName) {
        logPluginError(sessionId, `claim_consent_response missing clan name requestId=${requestId}`);
        return null;
    }
    return { declaredClanName, sessionAccount: state.sessionAccount, sessionRsn: state.sessionRsn };
}
