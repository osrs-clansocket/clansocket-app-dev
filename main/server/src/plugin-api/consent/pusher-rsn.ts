import { accountById, expirePendingConsents, pendingByHash } from "../../database/index.js";
import { send } from "../transport/send.js";
import { eachClient } from "../transport/wss-registry.js";
import type { PluginSocket } from "../session/socket-state.js";
import { formatRsnVerify } from "./formatters/broadcast-formatter.js";

export function requestMsg(
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

export function broadcastToAccount(
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

export interface LivePushArgs {
    accountHash: string;
    requestId: number;
    requestingDisplayName: string;
    requestedRsn: string;
    expiresAt: number;
}

export function pushLiveRequest(args: LivePushArgs): boolean {
    const { accountHash, requestId, requestingDisplayName, requestedRsn, expiresAt } = args;
    return broadcastToAccount(accountHash, (ws) => {
        send(ws, requestMsg(requestId, requestingDisplayName, requestedRsn, expiresAt));
        return { type: "broadcast", message: formatRsnVerify(requestingDisplayName, requestedRsn) };
    });
}

export function pushLiveCancel(accountHash: string, requestId: number): void {
    broadcastToAccount(accountHash, () => ({ type: "rsn_verify_cancelled", requestId }));
}
