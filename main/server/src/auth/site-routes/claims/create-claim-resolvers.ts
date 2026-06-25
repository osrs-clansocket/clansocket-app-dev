import type { Response } from "express";
import { HTTP_BAD_REQUEST, HTTP_FORBIDDEN } from "../../../shared/http/http-status.js";
import { RSN_MAX_LEN } from "../../../database/index.js";
import { liveByRsn, requestReidentifyAwait } from "../../../plugin-api/session/session-registry/index.js";
import { gateRsnSubmission } from "../../../runewatch/gates/rsn-submission-gate.js";
import {
    CLAIM_MESSAGE_BAD_PAYLOAD,
    CLAIM_MESSAGE_NO_LIVE_PLUGIN,
    CLAIM_REASON_BAD_PAYLOAD,
    CLAIM_REASON_NO_LIVE_PLUGIN,
    CLAIM_REIDENTIFY_TIMEOUT_MS,
} from "../../claim-messages.js";

type LiveSession = ReturnType<typeof liveByRsn>[number];

export interface ClaimSessionResolved {
    session: LiveSession;
    liveSessions: LiveSession[];
}

export async function validateGateClaim(rsn: unknown, res: Response): Promise<string | null> {
    if (typeof rsn !== "string" || rsn.trim().length === 0 || rsn.trim().length > RSN_MAX_LEN) {
        res.status(HTTP_BAD_REQUEST).json({
            ok: false,
            reason: CLAIM_REASON_BAD_PAYLOAD,
            message: CLAIM_MESSAGE_BAD_PAYLOAD,
        });
        return null;
    }
    const trimmedRsn = rsn.trim();
    const gate = await gateRsnSubmission(trimmedRsn);
    if (!gate.ok) {
        res.status(HTTP_FORBIDDEN).json({
            ok: false,
            reason: gate.reason,
            message: gate.message,
        });
        return null;
    }
    return trimmedRsn;
}

function respondNoLive(res: Response): null {
    res.status(HTTP_BAD_REQUEST).json({
        ok: false,
        reason: CLAIM_REASON_NO_LIVE_PLUGIN,
        message: CLAIM_MESSAGE_NO_LIVE_PLUGIN,
    });
    return null;
}

export async function resolveLiveSession(trimmedRsn: string, res: Response): Promise<ClaimSessionResolved | null> {
    let liveSessions = liveByRsn(trimmedRsn);
    if (liveSessions.length === 0) return respondNoLive(res);
    let session = liveSessions[0]!;
    if (!session.inGameClanId) {
        await requestReidentifyAwait(session.sessionId, CLAIM_REIDENTIFY_TIMEOUT_MS);
        liveSessions = liveByRsn(trimmedRsn);
        if (liveSessions.length === 0) return respondNoLive(res);
        session = liveSessions[0]!;
    }
    return { session, liveSessions };
}
