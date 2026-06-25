import type { Request } from "express";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import type { RegistrationResponseJSON } from "@simplewebauthn/server";
import { backupCodeFile } from "../../backup-code-file.js";
import { generateBackupCodes } from "../../backup-codes.js";
import { insertPasskey, listPasskeysAccount, passkeyDeviceSummary } from "../../passkey-store.js";
import { expectedOrigin, rpId } from "../config.js";

export interface RegisterPasskeyArgs {
    req: Request;
    response: RegistrationResponseJSON;
    challenge: string;
    siteAccountId: string;
    deviceName?: string;
}

export async function registerPasskey(args: RegisterPasskeyArgs): Promise<boolean> {
    const v = await verifyRegistrationResponse({
        response: args.response,
        expectedChallenge: args.challenge,
        expectedOrigin: expectedOrigin(args.req),
        expectedRPID: rpId(args.req),
    });
    if (!v.verified || !v.registrationInfo) return false;
    const cred = v.registrationInfo.credential;
    insertPasskey({
        siteAccountId: args.siteAccountId,
        credentialId: cred.id,
        publicKey: Buffer.from(cred.publicKey),
        deviceName: (args.deviceName ?? "").trim() || null,
    });
    return true;
}

export function buildBackupBundle(siteAccountId: string, displayName: string): { codes: string[]; file: string } {
    const codes = generateBackupCodes(siteAccountId);
    const devices = listPasskeysAccount(siteAccountId).map(passkeyDeviceSummary);
    const file = backupCodeFile({ siteAccountId, displayName, codes, devices });
    return { codes, file };
}
