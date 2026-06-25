import { HTTP_BAD_REQUEST } from "../../../shared/http/http-status.js";
import { type Request, type Response } from "express";
import { handleAsync } from "../../../api/middleware.js";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import type { AuthenticationResponseJSON } from "@simplewebauthn/server";
import { DB_NAMES, getDb } from "../../../database/index.js";
import { perMinuteLimiter } from "../../../shared/http/rate-limit.js";
import { CHALLENGE_PURPOSE_AUTHENTICATE, startChallenge } from "../challenge-store.js";
import { verifyPasskeyChallenge } from "../verifiers/challenge-verifier.js";
import { issueSession, rpId } from "./config.js";
import { markFreshAuth } from "./step-up.js";
import { mountedRouter } from "./_mount-registry.js";

const router = mountedRouter();

const authRateLimit = perMinuteLimiter({
    max: 20,
    message: { error: "rate_limit", message: "Rate limit hit — wait before retrying." },
});

router.post(
    "/authenticate/options",
    authRateLimit,
    handleAsync(async (req: Request, res: Response) => {
        const options = await generateAuthenticationOptions({ rpID: rpId(req), userVerification: "preferred" });
        startChallenge(options.challenge, CHALLENGE_PURPOSE_AUTHENTICATE);
        res.json(options);
    }),
);

async function runAuthVerify(
    req: Request,
    response: AuthenticationResponseJSON,
): Promise<{ siteAccountId: string } | { error: string; status: number }> {
    const r = await verifyPasskeyChallenge(req, response);
    if (r.kind === "error") return { error: r.error, status: r.status };
    getDb(DB_NAMES.APP)
        .prepare(`UPDATE clansocket_accounts SET last_login_at = ? WHERE id = ?`)
        .run(Date.now(), r.passkey.site_account_id);
    return { siteAccountId: r.passkey.site_account_id };
}

router.post(
    "/authenticate/verify",
    handleAsync(async (req: Request, res: Response) => {
        const body = req.body as { response?: AuthenticationResponseJSON };
        if (!body.response) {
            res.status(HTTP_BAD_REQUEST).json({ error: "response_required" });
            return;
        }
        const out = await runAuthVerify(req, body.response);
        if ("error" in out) {
            res.status(out.status).json({ error: out.error });
            return;
        }
        const sessionId = issueSession(res, req, out.siteAccountId);
        markFreshAuth(sessionId);
        res.json({ ok: true, siteAccountId: out.siteAccountId });
    }),
);

export default router;
