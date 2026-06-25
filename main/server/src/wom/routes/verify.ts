import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { handleAsync } from "../../api/middleware.js";
import { HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR } from "../../shared/http/http-status.js";
import { isPlainObject } from "../../shared/validators/type-guards.js";
import { preflightClan } from "../../clans/preflights/clan-preflight.js";
import { defaultUserAgent } from "../builders/default-ua-builder.js";
import { validateWomPayload } from "../validators/payload-validator.js";
import { verifyWomCredentials } from "../verifiers/credentials-verifier.js";
import { triggerVerifyRunewatch } from "../../runewatch/triggers/trigger-on-verify.js";
import { mountedRouter } from "./_mount-registry.js";

function fillDefault(payload: unknown, clanId: string): unknown {
    if (!isPlainObject(payload)) return payload;
    if (payload.user_agent !== undefined) return payload;
    return { ...payload, user_agent: defaultUserAgent(clanId) };
}

const router = mountedRouter();

router.post(
    "/:slug/verify",
    handleAsync(async (req: Request, res: Response) => {
        const ctx = preflightClan(req, res);
        if (!ctx) return;
        const { clan } = ctx;
        triggerVerifyRunewatch();
        try {
            const payload = fillDefault(req.body as unknown, clan.id);
            if (!validateWomPayload(payload)) {
                res.status(HTTP_BAD_REQUEST).json({ ok: false, reason: "invalid_payload" });
                return;
            }
            const result = await verifyWomCredentials(payload);
            if (result.status !== "ok") {
                res.json({ ok: false, reason: result.status });
                return;
            }
            res.json({ ok: true, public_metadata: result.public_metadata });
        } catch (err) {
            logger.error(`[wom] verify failed slug=${clan.slug}: ${(err as Error).message}`);
            res.status(HTTP_INTERNAL_ERROR).json({ error: "verify_failed" });
        }
    }),
);

export default router;
