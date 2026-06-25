import type { Request } from "express";
import {
    verifyAuthenticationResponse,
    type AuthenticationResponseJSON,
    type VerifiedAuthenticationResponse,
} from "@simplewebauthn/server";
import { HTTP_UNAUTHORIZED } from "../../../shared/http/http-status.js";
import { CHALLENGE_PURPOSE_AUTHENTICATE, challengeOf, consumeChallenge } from "../challenge-store.js";
import { expectedOrigin, rpId } from "../handlers/config.js";
import { passkeyByCredential, passkeyCredential, updateAfterAuth, type PasskeyRow } from "../passkey-store.js";

export type ChallengeError = { kind: "error"; error: string; status: number };
export type ChallengeOk = { kind: "ok"; passkey: PasskeyRow; verification: VerifiedAuthenticationResponse };
export type ChallengeResult = ChallengeOk | ChallengeError;

export async function verifyPasskeyChallenge(
    req: Request,
    response: AuthenticationResponseJSON,
    ownsPasskey?: (passkey: PasskeyRow) => boolean,
): Promise<ChallengeResult> {
    const ctx = consumeChallenge(challengeOf(response), CHALLENGE_PURPOSE_AUTHENTICATE);
    if (!ctx) return { kind: "error", error: "challenge_invalid", status: HTTP_UNAUTHORIZED };
    const passkey = passkeyByCredential(response.id);
    if (!passkey || (ownsPasskey !== undefined && !ownsPasskey(passkey))) {
        return { kind: "error", error: "credential_unknown", status: HTTP_UNAUTHORIZED };
    }
    const verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge: ctx.challenge,
        expectedOrigin: expectedOrigin(req),
        expectedRPID: rpId(req),
        credential: passkeyCredential(passkey),
    });
    if (!verification.verified) return { kind: "error", error: "verification_failed", status: HTTP_UNAUTHORIZED };
    updateAfterAuth(passkey.id, verification.authenticationInfo.newCounter);
    return { kind: "ok", passkey, verification };
}
