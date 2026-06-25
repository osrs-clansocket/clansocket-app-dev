import { type Response } from "express";
import { CLAIM_MESSAGE_AWAITING_CONSENT } from "../../claim-messages.js";

export interface AcceptedArgs {
    res: Response;
    requestId: number;
    expiresAt: number;
    liveSessionCount: number;
    clanName: string;
}

export function respondClaimAccepted(args: AcceptedArgs): void {
    args.res.json({
        ok: true,
        status: "awaiting-plugin-consent",
        requestId: args.requestId,
        expiresAt: args.expiresAt,
        liveSessions: args.liveSessionCount,
        clanName: args.clanName,
        message: CLAIM_MESSAGE_AWAITING_CONSENT,
    });
}
