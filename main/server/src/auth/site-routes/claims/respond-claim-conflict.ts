import { HTTP_CONFLICT } from "../../../shared/http/http-status.js";
import { type Response } from "express";
import { type ConsentRequestRow } from "../../../database/site/consent/types.js";

export function respondClaimConflict(res: Response, existing: ConsentRequestRow, clanName: string): void {
    res.status(HTTP_CONFLICT).json({
        clanName,
        ok: false,
        reason: "already_pending",
        requestId: existing.id,
        expiresAt: existing.expires_at,
        message: "A pending claim with that rsn + clan already exists. Cancel it before submitting again.",
    });
}
