import { pushClaimRequest } from "../../../plugin-api/consent/claim-push.js";

export interface PushArgs {
    rsn: string;
    requestId: number;
    requesterDisplayName: string;
    clanName: string;
    expiresAt: number;
}

export function notifyClaimPushed(args: PushArgs): void {
    pushClaimRequest({
        rsn: args.rsn,
        requestId: args.requestId,
        requestingDisplayName: args.requesterDisplayName,
        requestedRsn: args.rsn,
        requestedClanName: args.clanName,
        expiresAt: args.expiresAt,
    });
}
