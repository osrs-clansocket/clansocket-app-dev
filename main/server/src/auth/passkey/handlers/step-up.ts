import { HTTP_BAD_REQUEST, HTTP_FORBIDDEN, HTTP_OK } from "../../../shared/http/http-status.js";
import { type Request, type Response, type NextFunction } from "express";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import type { AuthenticationResponseJSON } from "@simplewebauthn/server";
import { handleAsync } from "../../../api/middleware.js";
import { FIVE_MINUTES_MS } from "../../../shared/time.js";
import { COOKIE_SITE_SESSION } from "../../oauth-providers.js";
import { readCookie } from "../../site-routes/oauth-session.js";
import { requireSiteAccount } from "../../site-middleware.js";
import { verifySiteSession } from "../../site-session.js";
import { CHALLENGE_PURPOSE_AUTHENTICATE, startChallenge } from "../challenge-store.js";
import { countPasskeysAccount, listPasskeysAccount, passkeyDescriptor } from "../passkey-store.js";
import { listProvidersAccount } from "../../../database/site/site-accounts/index.js";
import { verifyPasskeyChallenge } from "../verifiers/challenge-verifier.js";
import { rpId } from "./config.js";
import { mountedRouter } from "./_mount-registry.js";

export const STEP_UP_TTL_MS = FIVE_MINUTES_MS;
const freshAuthMap = new Map<string, number>();

export function markFreshAuth(sessionId: string): void {
    freshAuthMap.set(sessionId, Date.now());
}

export function isFreshAuth(sessionId: string, maxAgeMs: number = STEP_UP_TTL_MS): boolean {
    const at = freshAuthMap.get(sessionId);
    if (at === undefined) return false;
    if (Date.now() - at > maxAgeMs) {
        freshAuthMap.delete(sessionId);
        return false;
    }
    return true;
}

export function clearFreshAuth(sessionId: string): void {
    freshAuthMap.delete(sessionId);
}

function sessionCookie(req: Request): string | undefined {
    return readCookie(req, COOKIE_SITE_SESSION);
}

export function requireRecentAuth(req: Request, res: Response, next: NextFunction): void {
    const siteAccountId = req.siteAccountId!;
    if (countPasskeysAccount(siteAccountId) === 0) {
        next();
        return;
    }
    if (listProvidersAccount(siteAccountId).length > 0) {
        next();
        return;
    }
    const sessionId = sessionCookie(req);
    if (sessionId !== undefined && isFreshAuth(sessionId)) {
        next();
        return;
    }
    res.status(HTTP_FORBIDDEN).json({
        error: "step_up_required",
        message: "Re-authenticate with ur passkey to confirm this action.",
    });
}

const router = mountedRouter();

router.post(
    "/step-up/options",
    requireSiteAccount,
    handleAsync(async (req: Request, res: Response) => {
        const siteAccountId = req.siteAccountId!;
        const passkeys = listPasskeysAccount(siteAccountId);
        const options = await generateAuthenticationOptions({
            rpID: rpId(req),
            userVerification: "required",
            allowCredentials: passkeys.map(passkeyDescriptor),
        });
        startChallenge(options.challenge, CHALLENGE_PURPOSE_AUTHENTICATE, siteAccountId);
        res.json(options);
    }),
);

async function runStepUp(
    req: Request,
    siteAccountId: string,
    response: AuthenticationResponseJSON,
): Promise<{ status: number; error?: string }> {
    const r = await verifyPasskeyChallenge(req, response, (p) => p.site_account_id === siteAccountId);
    if (r.kind === "error") return { status: r.status, error: r.error };
    const sessionId = sessionCookie(req);
    if (sessionId !== undefined && verifySiteSession(sessionId)) markFreshAuth(sessionId);
    return { status: HTTP_OK };
}

router.post(
    "/step-up/verify",
    requireSiteAccount,
    handleAsync(async (req: Request, res: Response) => {
        const body = req.body as { response?: AuthenticationResponseJSON };
        if (!body.response) {
            res.status(HTTP_BAD_REQUEST).json({ error: "response_required" });
            return;
        }
        const out = await runStepUp(req, req.siteAccountId!, body.response);
        if (out.error) {
            res.status(out.status).json({ error: out.error });
            return;
        }
        res.json({ ok: true });
    }),
);

export default router;
