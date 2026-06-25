import { startRegistration } from "@simplewebauthn/browser";
import type { PublicKeyCredentialCreationOptionsJSON, RegistrationResponseJSON } from "@simplewebauthn/browser";
import { deriveDeviceName } from "../derive-device-name";
import { postJSON } from "./http.js";
import { PASSKEY_ERR, isPasskeyError, type PasskeyError, type SignupResult } from "./types.js";

export interface RegisterOptionsRequest {
    mode: "new" | "link" | "recover";
    displayName?: string;
    linkCode?: string;
    backupCode?: string;
}

export async function doRegisterDevice(
    req: RegisterOptionsRequest,
    deviceName: string | null,
): Promise<SignupResult | PasskeyError> {
    const options = await postJSON<PublicKeyCredentialCreationOptionsJSON>(
        "/api/auth/site/passkey/register/options",
        req,
    );
    if (isPasskeyError(options)) return options;
    let attResponse: RegistrationResponseJSON;
    try {
        attResponse = await startRegistration({ optionsJSON: options });
    } catch (err) {
        return { error: PASSKEY_ERR.aborted, message: (err as Error).message };
    }
    return await postJSON<SignupResult>("/api/auth/site/passkey/register/verify", {
        response: attResponse,
        deviceName: deviceName ?? deriveDeviceName(),
    });
}
