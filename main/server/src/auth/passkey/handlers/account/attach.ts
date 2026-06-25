import { HTTP_BAD_REQUEST, HTTP_FORBIDDEN } from "../../../../shared/http/http-status.js";
import { type Request, type Response } from "express";
import { handleAsync } from "../../../../api/middleware.js";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import type { RegistrationResponseJSON } from "@simplewebauthn/server";
import type { SiteAccountRow } from "../../../../database/site/site-accounts/index.js";
import { requireSiteAccount } from "../../../site-middleware.js";
import { CHALLENGE_PURPOSE_REGISTER, consumeChallenge, startChallenge } from "../../challenge-store.js";
import { countPasskeysAccount, listPasskeysAccount, passkeyDescriptor } from "../../passkey-store.js";
import { rpId, rpName } from "../config.js";
import { registerPasskey } from "../register/verify-and-insert.js";
import { requireRecentAuth } from "../step-up.js";
import { MAX_PASSKEYS, OK_FLAG, audit, challengeOf, loadAccountOr404 } from "./account-utils.js";
import { mountedRouter } from "../_mount-registry.js";

const router = mountedRouter();

async function buildAttachOptions(
    req: Request,
    siteAccountId: string,
    account: SiteAccountRow,
): Promise<{ challenge: string; payload: unknown }> {
    const userName = `${account.display_name ?? "ClanSocket user"} - ${rpName()}`;
    const options = await generateRegistrationOptions({
        userName,
        rpName: rpName(),
        rpID: rpId(req),
        userID: Buffer.from(siteAccountId, "utf8"),
        userDisplayName: userName,
        attestationType: "none",
        authenticatorSelection: { residentKey: "preferred", userVerification: "required" },
        excludeCredentials: listPasskeysAccount(siteAccountId).map(passkeyDescriptor),
    });
    return { challenge: options.challenge, payload: options };
}

(() => {
    router.post(
        "/attach/options",
        requireSiteAccount,
        requireRecentAuth,
        handleAsync(async (req: Request, res: Response) => {
            const siteAccountId = req.siteAccountId!;
            if (countPasskeysAccount(siteAccountId) >= MAX_PASSKEYS) {
                res.status(HTTP_FORBIDDEN).json({
                    error: "passkey_cap_reached",
                    message: `Maximum ${MAX_PASSKEYS} passkeys per account.`,
                });
                return;
            }
            const account = loadAccountOr404(siteAccountId, res);
            if (account === null) return;
            const { challenge, payload } = await buildAttachOptions(req, siteAccountId, account);
            startChallenge(challenge, CHALLENGE_PURPOSE_REGISTER, siteAccountId);
            res.json(payload);
        }),
    );
})();

interface VerifyGate {
    response: RegistrationResponseJSON;
    challenge: string;
}

function gateVerify(
    siteAccountId: string,
    body: { response?: RegistrationResponseJSON; deviceName?: string },
    res: Response,
): VerifyGate | null {
    if (!body.response) {
        res.status(HTTP_BAD_REQUEST).json({ error: "response_required" });
        return null;
    }
    const ctx = consumeChallenge(challengeOf(body.response), CHALLENGE_PURPOSE_REGISTER);
    if (!ctx || ctx.siteAccountId !== siteAccountId) {
        res.status(HTTP_FORBIDDEN).json({ error: "challenge_invalid" });
        return null;
    }
    return { response: body.response, challenge: ctx.challenge };
}

function reportVerifyResult(res: Response, ok: boolean, siteAccountId: string): void {
    if (!ok) {
        res.status(HTTP_FORBIDDEN).json({ error: "verification_failed" });
        return;
    }
    audit(siteAccountId, "New passkey added", "A passkey for this account was registered on a device.");
    res.json({ ok: OK_FLAG });
}

(() => {
    router.post(
        "/attach/verify",
        requireSiteAccount,
        requireRecentAuth,
        handleAsync(async (req: Request, res: Response) => {
            const siteAccountId = req.siteAccountId!;
            const body = req.body as { response?: RegistrationResponseJSON; deviceName?: string };
            const gate = gateVerify(siteAccountId, body, res);
            if (!gate) return;
            const ok = await registerPasskey({
                req,
                siteAccountId,
                response: gate.response,
                challenge: gate.challenge,
                deviceName: body.deviceName,
            });
            reportVerifyResult(res, ok, siteAccountId);
        }),
    );
})();

export default router;
