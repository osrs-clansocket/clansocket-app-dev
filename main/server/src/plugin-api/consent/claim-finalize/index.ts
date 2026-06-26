import {
    ClanClaimError,
    finalizeClanClaim,
    consentById,
    resolveConsentRequest,
    orCreateClan,
} from "../../../database/index.js";
import { CONSENT_CONFIRMED, CONSENT_REJECTED } from "../../../database/site/consent/types.js";
import { EVENT_REIDENTIFY } from "../../event-types.js";
import { logPluginError } from "../../logger/index.js";
import { send } from "../../transport/send.js";
import type { DispatchContext } from "../../handlers/dispatch-types.js";
import { confirmClaim, rejectClaim, reportFinalizeFailure } from "./claim-notifications.js";
import { ingestRosterClaim, ingestTitlesClaim, type ClaimConsentResponse } from "./ingest.js";
import { deriveClaimSlug } from "./slug.js";
import { validateClaimAuthorization } from "./validate-claim-authorization.js";
import { validateClaimConsent, type ClaimConsent } from "./validate-claim-consent.js";

function ingestClaimProof(
    ctx: DispatchContext,
    clanId: string,
    accountHash: string,
    proof: ClaimConsentResponse["clanProof"],
): void {
    const { state, sessionId } = ctx;
    if (proof?.roster && proof.roster.members.length > 0) {
        ingestRosterClaim({ state, sessionId, clanId, accountHash, roster: proof.roster });
    }
    if (proof?.titles && proof.titles.titles.length > 0) {
        ingestTitlesClaim(state, clanId, proof.titles, sessionId);
    }
}

interface FinalizeArgs {
    consent: ClaimConsent;
    declaredClanName: string;
    sessionAccount: string;
    sessionRsn: string;
    clanId: string;
}

function applyFinalize(ctx: DispatchContext, a: FinalizeArgs): boolean {
    const { state, sessionId } = ctx;
    try {
        const slug = deriveClaimSlug(a.declaredClanName, a.clanId);
        const finalized = finalizeClanClaim({
            slug,
            displayName: a.declaredClanName,
            siteAccountId: a.consent.requesting_site_account_id,
            accountHash: a.sessionAccount,
            rsn: a.sessionRsn,
        });
        state.sockClanId = finalized.id;
        state.clanStatus = finalized.status;
        state.clanVerified = true;
        return true;
    } catch (err) {
        const reason = err instanceof ClanClaimError ? err.code : "internal";
        logPluginError(sessionId, `claim finalize failed: ${(err as Error).message}`);
        reportFinalizeFailure(a.consent, a.clanId, a.declaredClanName, reason);
        return false;
    }
}

export function handleClaimConsent(ctx: DispatchContext, msg: ClaimConsentResponse): void {
    const { sessionId } = ctx;
    const { requestId, action } = msg;
    const consent = consentById(requestId);
    if (!consent || consent.kind !== "claim") {
        logPluginError(sessionId, `claim_consent_response unknown or wrong kind requestId=${requestId}`);
        return;
    }
    const validated = validateClaimConsent(ctx, consent, requestId);
    if (!validated) return;
    const { declaredClanName, sessionAccount, sessionRsn } = validated;
    const clan = orCreateClan(declaredClanName);
    if (action === "reject") {
        if (!resolveConsentRequest(requestId, CONSENT_REJECTED)) return;
        rejectClaim(consent, clan.id, declaredClanName);
        return;
    }
    if (!validateClaimAuthorization(ctx, clan.id, requestId)) return;
    if (!resolveConsentRequest(requestId, CONSENT_CONFIRMED)) return;
    if (!applyFinalize(ctx, { consent, declaredClanName, sessionAccount, sessionRsn, clanId: clan.id })) return;
    ingestClaimProof(ctx, clan.id, sessionAccount, msg.clanProof);
    confirmClaim(consent, clan.id, declaredClanName);
    send(ctx.ws, { type: EVENT_REIDENTIFY });
}
