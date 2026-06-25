import { HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR } from "../../../shared/http/http-status.js";
import logger from "@clansocket/logger";
import { type Request, type Response, Router } from "express";
import { requireSiteAccount } from "../../../auth/site-middleware.js";
import { actionFeedbackText } from "./feedback.js";
import { type SendBody, validateSendBody } from "./normalizers/body-validator.js";
import { attachAbortClose, prepareSse, runSend, type SendCtx } from "./send-runner.js";

const router = Router();

router.post("/send", requireSiteAccount, async (req: Request, res: Response) => {
    try {
        const body = req.body as SendBody;
        const validationError = validateSendBody(body);
        if (validationError !== null) {
            res.status(HTTP_BAD_REQUEST).json({ error: validationError });
            return;
        }
        if (body.kind === "action-feedback") {
            body.text = actionFeedbackText(body.actionResults, body.priorChainId);
        }
        prepareSse(res);
        const ctx: SendCtx = { body, res, siteAccountId: req.siteAccountId!, abortRef: { aborted: false } };
        attachAbortClose(ctx);
        await runSend(ctx);
    } catch (err) {
        logger.error(`[ai/chat/send] unhandled: ${err instanceof Error ? err.message : String(err)}`);
        if (!res.headersSent) res.status(HTTP_INTERNAL_ERROR).end();
    }
});

export default router;
