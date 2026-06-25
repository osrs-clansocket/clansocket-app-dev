import { HTTP_BAD_REQUEST } from "../../../shared/http/http-status.js";
import { type Response } from "express";
import { CLAIM_MESSAGE_NO_CLAN, CLAIM_REASON_NO_CLAN } from "../../claim-messages.js";

export function respondNoClan(res: Response): void {
    res.status(HTTP_BAD_REQUEST).json({ ok: false, reason: CLAIM_REASON_NO_CLAN, message: CLAIM_MESSAGE_NO_CLAN });
}
