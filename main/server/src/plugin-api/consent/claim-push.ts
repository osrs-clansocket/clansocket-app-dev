import logger from "@clansocket/logger";
import { pendingByRsn, accountById } from "../../database/index.js";
import { isNonBlank } from "../../shared/validators/type-guards.js";
import { send } from "../transport/send.js";
import type { PluginSocket } from "../session/socket-state.js";
import { eachClient } from "../transport/wss-registry.js";
import { formatClaim } from "./formatters/broadcast-formatter.js";

function replayOneClaim(ws: PluginSocket, row: ReturnType<typeof pendingByRsn>[number]): void {
    const requester = accountById(row.requesting_site_account_id);
    const requesterName = requester?.display_name ?? "someone";
    const requestedClanName = row.declared_clan_name ?? "";
    send(ws, {
        requestedClanName,
        type: "claim_consent_request",
        requestId: row.id,
        requestingDisplayName: requesterName,
        requestedRsn: row.target_rsn,
        expiresAt: row.expires_at,
    });
    send(ws, { type: "broadcast", message: formatClaim(requesterName, row.target_rsn, requestedClanName) });
}

export function pushByRsn(ws: PluginSocket, rsn: string): void {
    const claimRows = pendingByRsn(rsn, "claim");
    if (claimRows.length === 0) {
        logger.info(`[plugin-api/claim-push] identity replay: no pending claim consents for rsn="${rsn}"`);
        return;
    }
    logger.info(
        `[plugin-api/claim-push] identity replay: pushing ${claimRows.length} pending claim consent(s) for rsn="${rsn}"`,
    );
    for (const row of claimRows) replayOneClaim(ws, row);
}

function rsnMatches(sessionRsn: string | null | undefined, target: string): boolean {
    if (!isNonBlank(sessionRsn)) return false;
    return sessionRsn.toLowerCase() === target.toLowerCase();
}

export interface LivePushArgs {
    rsn: string;
    requestId: number;
    requestingDisplayName: string;
    requestedRsn: string;
    requestedClanName: string;
    expiresAt: number;
}

function sendOneClaim(ws: Parameters<Parameters<typeof eachClient>[0]>[0], args: LivePushArgs): void {
    const { requestId, requestingDisplayName, requestedRsn, requestedClanName, expiresAt } = args;
    send(ws, {
        requestId,
        requestingDisplayName,
        requestedRsn,
        requestedClanName,
        expiresAt,
        type: "claim_consent_request",
    });
    send(ws, {
        type: "broadcast",
        message: formatClaim(requestingDisplayName, requestedRsn, requestedClanName),
    });
}

export function pushClaimRequest(args: LivePushArgs): boolean {
    let sent = false;
    eachClient((ws) => {
        if (!rsnMatches(ws.pluginState?.sessionRsn, args.rsn)) return;
        sendOneClaim(ws, args);
        sent = true;
    });
    if (sent) {
        logger.info(
            `[plugin-api/claim-push] live push: claim_consent_request delivered to session rsn~="${args.rsn}" requestId=${args.requestId}`,
        );
    } else {
        logger.info(
            `[plugin-api/claim-push] live push: no matching live session for rsn~="${args.rsn}" requestId=${args.requestId} — will replay on next identity`,
        );
    }
    return sent;
}

export function pushClaimCancel(rsn: string, requestId: number): void {
    eachClient((ws) => {
        if (!rsnMatches(ws.pluginState?.sessionRsn, rsn)) return;
        send(ws, { type: "claim_consent_cancelled", requestId });
    });
}
