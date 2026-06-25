import {
    expirePendingConsents,
    consentById,
    pendingByHash,
    accountById,
    resolveConsentRequest,
} from "../../database/index.js";
import { bindAccountHash } from "../../database/site/site-accounts/index.js";
import { upsertVerifiedRsn } from "../../database/index.js";
import { broadcastIdentityUpdate } from "../../data-rights/streams/identity-stream.js";
import { insertNotification } from "../../notifications/notification-store.js";
import { logPluginError } from "../logger/index.js";
import { send } from "../transport/send.js";
import type { PluginSocket } from "../session/socket-state.js";
import type { PluginClientMessage } from "../types/index.js";
import { eachClient } from "../transport/wss-registry.js";
import type { DispatchContext } from "../handlers/dispatch.js";
import { formatRsnVerify } from "./formatters/broadcast-formatter.js";

type ResponseMsg = Extract<PluginClientMessage, { type: "rsn_verify_response" }>;

function requestMsg(
    requestId: number,
    requestingDisplayName: string,
    requestedRsn: string,
    expiresAt: number,
): {
    type: "rsn_verify_request";
    requestId: number;
    requestingDisplayName: string;
    requestedRsn: string;
    expiresAt: number;
} {
    return { type: "rsn_verify_request", requestId, requestingDisplayName, requestedRsn, expiresAt };
}

function broadcastToAccount(
    accountHash: string,
    build: (ws: PluginSocket) => Parameters<typeof send>[1] | null,
): boolean {
    let sent = false;
    eachClient((ws) => {
        if (ws.pluginState?.sessionAccount !== accountHash) return;
        const msg = build(ws);
        if (msg === null) return;
        send(ws, msg);
        sent = true;
    });
    return sent;
}

export function pushPending(ws: PluginSocket, accountHash: string): void {
    expirePendingConsents();
    const pending = pendingByHash(accountHash, "rsn");
    for (const req of pending) {
        const requester = accountById(req.requesting_site_account_id);
        const requesterName = requester?.display_name ?? "someone";
        send(ws, requestMsg(req.id, requesterName, req.target_rsn, req.expires_at));
        send(ws, {
            type: "broadcast",
            message: formatRsnVerify(requesterName, req.target_rsn),
        });
    }
}

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
    if (req.status !== "pending") {
        logPluginError(sessionId, `rsn_verify_response stale requestId=${requestId} status=${req.status}`);
        return false;
    }
    return true;
}

function notifyVerifyOutcome(req: NonNullable<ReturnType<typeof consentById>>, action: "confirm" | "reject"): void {
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
    broadcastIdentityUpdate(req.requesting_site_account_id, action === "confirm" ? "confirmed" : "rejected");
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
    if (!resolveConsentRequest(requestId, action === "confirm" ? "confirmed" : "rejected")) return;
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

export interface LivePushArgs {
    accountHash: string;
    requestId: number;
    requestingDisplayName: string;
    requestedRsn: string;
    expiresAt: number;
}

export function pushLiveRequest(args: LivePushArgs): boolean {
    const { accountHash, requestId, requestingDisplayName, requestedRsn, expiresAt } = args;
    let sent = false;
    eachClient((ws) => {
        if (ws.pluginState?.sessionAccount !== accountHash) return;
        send(ws, requestMsg(requestId, requestingDisplayName, requestedRsn, expiresAt));
        send(ws, {
            type: "broadcast",
            message: formatRsnVerify(requestingDisplayName, requestedRsn),
        });
        sent = true;
    });
    return sent;
}

export function pushLiveCancel(accountHash: string, requestId: number): void {
    broadcastToAccount(accountHash, () => ({ type: "rsn_verify_cancelled", requestId }));
}
