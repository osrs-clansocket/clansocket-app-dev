import { consentById, resolveConsentRequest } from "../../database/index.js";
import { bindAccountHash } from "../../database/site/site-accounts/index.js";
import { upsertVerifiedRsn } from "../../database/index.js";
import { CONSENT_CONFIRMED, CONSENT_PENDING, CONSENT_REJECTED } from "../../database/site/consent/types.js";
import { broadcastIdentityUpdate } from "../../data-rights/streams/identity-stream.js";
import { insertNotification } from "../../notifications/notification-store.js";
import { logPluginError } from "../logger/index.js";
import type { PluginClientMessage } from "../types/index.js";
import type { DispatchContext } from "../handlers/dispatch-types.js";

export { pushPending, pushLiveRequest, pushLiveCancel, type LivePushArgs } from "./pusher-rsn.js";

type ResponseMsg = Extract<PluginClientMessage, { type: "rsn_verify_response" }>;
type ConsentRow = NonNullable<ReturnType<typeof consentById>>;

function validateConsent(ctx: DispatchContext, req: ConsentRow, requestId: number): boolean {
    const { state, sessionId } = ctx;
    if (req.kind !== "rsn" || req.target_account_hash === null) {
        logPluginError(sessionId, `rsn_verify_response wrong kind requestId=${requestId} kind=${req.kind}`);
        return false;
    }
    if (!state.sessionAccount || req.target_account_hash !== state.sessionAccount) {
        logPluginError(sessionId, `rsn_verify_response wrong account requestId=${requestId}`);
        return false;
    }
    if (req.status !== CONSENT_PENDING) {
        logPluginError(sessionId, `rsn_verify_response stale requestId=${requestId} status=${req.status}`);
        return false;
    }
    return true;
}

function notifyVerifyOutcome(req: ConsentRow, action: "confirm" | "reject"): void {
    insertNotification({
        siteAccountId: req.requesting_site_account_id,
        kind: action === "confirm" ? "rsn_verified" : "rsn_rejected",
        title: action === "confirm" ? "RSN verified" : "RSN claim rejected",
        body:
            action === "confirm"
                ? `'${req.target_rsn}' is now linked to your account.`
                : `The holder of '${req.target_rsn}' rejected your claim.`,
        href: "/account",
    });
    broadcastIdentityUpdate(
        req.requesting_site_account_id,
        action === "confirm" ? CONSENT_CONFIRMED : CONSENT_REJECTED,
    );
}

export function handleResponse(ctx: DispatchContext, msg: ResponseMsg): void {
    const { sessionId } = ctx;
    const { requestId, action } = msg;
    const req = consentById(requestId);
    if (!req) {
        logPluginError(sessionId, `rsn_verify_response unknown requestId=${requestId}`);
        return;
    }
    if (!validateConsent(ctx, req, requestId)) return;
    const status = action === "confirm" ? CONSENT_CONFIRMED : CONSENT_REJECTED;
    if (!resolveConsentRequest(requestId, status)) return;
    if (action === "confirm") {
        try {
            bindAccountHash(req.requesting_site_account_id, req.target_account_hash!);
            upsertVerifiedRsn(req.target_account_hash!, req.target_rsn, "site");
        } catch (err) {
            logPluginError(sessionId, `rsn confirm bind failed: ${(err as Error).message}`);
        }
    }
    notifyVerifyOutcome(req, action);
}
