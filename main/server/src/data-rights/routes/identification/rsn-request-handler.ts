import { HTTP_BAD_REQUEST, HTTP_CONFLICT, HTTP_FORBIDDEN, HTTP_NOT_FOUND } from "../../../shared/http/http-status.js";
import { type Request, type Response } from "express";
import { handleAsync } from "../../../api/middleware.js";
import { accountById, createConsentRequest, pendingByAccount, rsnSeen, RSN_MAX_LEN } from "../../../database/index.js";
import { pushLiveRequest } from "../../../plugin-api/consent/rsn-verify.js";
import { gateRsnSubmission } from "../../../runewatch/gates/rsn-submission-gate.js";
import { broadcastIdentityUpdate } from "../../streams/identity-stream.js";
import { rsnRequestView } from "./rsn-shapers.js";
import { validRsn } from "./rsn-validate.js";

async function checkRsnGate(rsnRaw: unknown, res: Response): Promise<string | null> {
    if (!validRsn(rsnRaw)) {
        res.status(HTTP_BAD_REQUEST).json({
            error: "bad_rsn",
            message: `RSN must be 1-${RSN_MAX_LEN} chars, alphanumeric + space/underscore/dash.`,
        });
        return null;
    }
    const rsn = (rsnRaw as string).trim();
    const gate = await gateRsnSubmission(rsn);
    if (!gate.ok) {
        res.status(HTTP_FORBIDDEN).json({ error: gate.reason, message: gate.message });
        return null;
    }
    return rsn;
}

function resolveTargetHash(rsn: string, res: Response): string | null {
    const targetAccountHash = rsnSeen(rsn);
    if (!targetAccountHash) {
        res.status(HTTP_NOT_FOUND).json({
            error: "rsn_unknown",
            message: "No plugin session has reported this name — connect via plugin first.",
        });
        return null;
    }
    return targetAccountHash;
}

interface ConsentCreated {
    id: number;
    target_rsn: string;
    created_at: number;
    expires_at: number;
}

interface PushArgs {
    siteAccountId: string;
    targetAccountHash: string;
    rsn: string;
    res: Response;
}

function pushAndRespond(created: ConsentCreated, args: PushArgs): void {
    const requester = accountById(args.siteAccountId);
    pushLiveRequest({
        accountHash: args.targetAccountHash,
        requestId: created.id,
        requestingDisplayName: requester?.display_name ?? "someone",
        requestedRsn: args.rsn,
        expiresAt: created.expires_at,
    });
    broadcastIdentityUpdate(args.siteAccountId, "created");
    args.res.json(rsnRequestView(created.id, created.target_rsn, created.created_at, created.expires_at));
}

export const handleRsnRequest = handleAsync(async (req: Request, res: Response) => {
    const siteAccountId = req.siteAccountId!;
    const rsn = await checkRsnGate((req.body ?? {}).rsn, res);
    if (rsn === null) return;
    const targetAccountHash = resolveTargetHash(rsn, res);
    if (targetAccountHash === null) return;
    const existing = pendingByAccount(siteAccountId, "rsn").find((r) => r.target_rsn === rsn);
    if (existing) {
        res.status(HTTP_CONFLICT).json({ error: "already_pending", requestId: existing.id });
        return;
    }
    const created = createConsentRequest({
        targetAccountHash,
        kind: "rsn",
        requestingSiteAccountId: siteAccountId,
        targetRsn: rsn,
    });
    pushAndRespond(created, { siteAccountId, targetAccountHash, rsn, res });
});
