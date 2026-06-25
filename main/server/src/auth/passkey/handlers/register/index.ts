import { HTTP_BAD_REQUEST, HTTP_FORBIDDEN } from "../../../../shared/http/http-status.js";
import { sendError } from "../../../../shared/http/send-error.js";
import { type Request, type Response } from "express";
import { randomUUID } from "node:crypto";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import type { RegistrationResponseJSON } from "@simplewebauthn/server";
import { handleAsync } from "../../../../api/middleware.js";
import { perMinuteLimiter } from "../../../../shared/http/rate-limit.js";
import { CHALLENGE_PURPOSE_REGISTER, consumeChallenge, storeChallenge } from "../../challenge-store.js";
import { issueSession, rpId, rpName } from "../config.js";
import { markFreshAuth } from "../step-up.js";
import { challengeOf, resolveContext, resolveTarget, type RegisterBody } from "./context.js";
import { buildBackupBundle, registerPasskey } from "./verify-and-insert.js";
import { mountedRouter } from "../_mount-registry.js";

const router = mountedRouter();

const registerRateLimit = perMinuteLimiter({
    max: 20,
    message: { error: "rate_limit", message: "Rate limit hit — wait before retrying." },
});

router.post(
    "/register/options",
    registerRateLimit,
    handleAsync(async (req: Request, res: Response) => {
        const resolved = resolveContext(req.body as RegisterBody);
        if ("error" in resolved) {
            sendError(res, HTTP_BAD_REQUEST, resolved.error);
            return;
        }
        const userId = resolved.siteAccountId ?? randomUUID();
        const baseName = resolved.displayName ?? "ClanSocket user";
        const userName = `${baseName} - ${rpName()}`;
        const options = await generateRegistrationOptions({
            userName,
            rpName: rpName(),
            rpID: rpId(req),
            userID: Buffer.from(userId, "utf8"),
            userDisplayName: userName,
            attestationType: "none",
            authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" },
        });
        storeChallenge({ ...resolved, challenge: options.challenge });
        res.json(options);
    }),
);

interface VerifyGate {
    ctx: NonNullable<ReturnType<typeof consumeChallenge>>;
    target: Extract<ReturnType<typeof resolveTarget>, { siteAccountId: string }>;
    body: { response: RegistrationResponseJSON; deviceName?: string };
}

function gateRegisterVerify(
    reqBody: { response?: RegistrationResponseJSON; deviceName?: string },
    res: Response,
): VerifyGate | null {
    if (!reqBody.response) {
        sendError(res, HTTP_BAD_REQUEST, "response_required");
        return null;
    }
    const ctx = consumeChallenge(challengeOf(reqBody.response), CHALLENGE_PURPOSE_REGISTER);
    if (!ctx) {
        sendError(res, HTTP_FORBIDDEN, "challenge_invalid");
        return null;
    }
    const target = resolveTarget(ctx);
    if ("error" in target) {
        sendError(res, HTTP_BAD_REQUEST, target.error);
        return null;
    }
    return { ctx, target, body: reqBody as { response: RegistrationResponseJSON; deviceName?: string } };
}

router.post(
    "/register/verify",
    handleAsync(async (req: Request, res: Response) => {
        const gate = gateRegisterVerify(req.body as { response?: RegistrationResponseJSON; deviceName?: string }, res);
        if (!gate) return;
        const ok = await registerPasskey({
            req,
            response: gate.body.response,
            challenge: gate.ctx.challenge,
            siteAccountId: gate.target.siteAccountId,
            deviceName: gate.body.deviceName,
        });
        if (!ok) {
            sendError(res, HTTP_FORBIDDEN, "verification_failed");
            return;
        }
        const isNew = gate.ctx.siteAccountId !== null && gate.ctx.linkCode === null && gate.ctx.backupCode === null;
        const bundle = isNew ? buildBackupBundle(gate.target.siteAccountId, gate.target.displayName) : null;
        const sessionId = issueSession(res, req, gate.target.siteAccountId);
        markFreshAuth(sessionId);
        res.json({
            ok: true,
            siteAccountId: gate.target.siteAccountId,
            backupCodes: bundle?.codes ?? null,
            backupCodesFile: bundle?.file ?? null,
        });
    }),
);

export default router;
