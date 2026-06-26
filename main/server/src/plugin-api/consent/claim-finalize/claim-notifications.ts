import { ClanAuditActions, recordClanAudit, type ClanAuditAction } from "../../../database/index.js";
import { broadcastIdentityUpdate } from "../../../data-rights/streams/identity-stream.js";
import { insertNotification } from "../../../notifications/notification-store.js";

const ACCOUNT_HREF = "/account";
const CLAIM_RESOLVED = "claim_consent_resolved";
const KIND_CLAIM_REJECTED = "claim_rejected";

const notifyEnvelope = (kind: string, title: string, body: string): { kind: string; title: string; body: string } => ({
    kind,
    title,
    body,
});

function notifyClaim(accountId: string, kind: string, title: string, body: string): void {
    insertNotification({ kind, title, body, siteAccountId: accountId, href: ACCOUNT_HREF });
}

function auditClaim(clanId: string, actor: string, action: ClanAuditAction, payload: Record<string, unknown>): void {
    recordClanAudit(clanId, { actor, action, payload, targetId: clanId });
}

interface ClaimOutcomeArgs {
    consent: { requesting_site_account_id: string; target_rsn: string };
    clanId: string;
    declaredClanName: string;
    notify: { kind: string; title: string; body: string };
    audit: { action: ClanAuditAction; extra?: Record<string, unknown> };
}

function dispatchClaimOutcome(args: ClaimOutcomeArgs): void {
    const { consent, clanId, declaredClanName, notify, audit } = args;
    notifyClaim(consent.requesting_site_account_id, notify.kind, notify.title, notify.body);
    auditClaim(clanId, consent.requesting_site_account_id, audit.action, {
        declaredRsn: consent.target_rsn,
        declaredClanName,
        ...(audit.extra ?? {}),
    });
    broadcastIdentityUpdate(consent.requesting_site_account_id, CLAIM_RESOLVED);
}

export function rejectClaim(
    consent: { requesting_site_account_id: string; target_rsn: string },
    clanId: string,
    declaredClanName: string,
): void {
    dispatchClaimOutcome({
        consent,
        clanId,
        declaredClanName,
        notify: notifyEnvelope(
            KIND_CLAIM_REJECTED,
            "Clan claim rejected",
            `The holder of '${consent.target_rsn}' rejected the claim on '${declaredClanName}'.`,
        ),
        audit: { action: ClanAuditActions.ClaimConsentRejected },
    });
}

export function reportFinalizeFailure(
    consent: { requesting_site_account_id: string; target_rsn: string },
    clanId: string,
    declaredClanName: string,
    reason: string,
): void {
    dispatchClaimOutcome({
        consent,
        clanId,
        declaredClanName,
        notify: notifyEnvelope(
            KIND_CLAIM_REJECTED,
            "Clan claim failed",
            `Claim on '${declaredClanName}' could not finalize (${reason}).`,
        ),
        audit: { action: ClanAuditActions.ClaimRejected, extra: { reason } },
    });
}

export function confirmClaim(
    consent: { requesting_site_account_id: string; target_rsn: string },
    clanId: string,
    declaredClanName: string,
): void {
    dispatchClaimOutcome({
        consent,
        clanId,
        declaredClanName,
        notify: notifyEnvelope("claim_confirmed", "Clan claimed", `You now own '${declaredClanName}'.`),
        audit: { action: ClanAuditActions.ClaimConsentConfirmed },
    });
}
