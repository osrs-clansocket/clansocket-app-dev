import { startAuthentication } from "@simplewebauthn/browser";
import type { AuthenticationResponseJSON, PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/browser";
import { postJSON } from "./http.js";
import { PASSKEY_ERR, isPasskeyError, type PasskeyError } from "./types.js";

export async function signinWithDevice(): Promise<{ siteAccountId: string } | PasskeyError> {
    const options = await postJSON<PublicKeyCredentialRequestOptionsJSON>(
        "/api/auth/site/passkey/authenticate/options",
        {},
    );
    if (isPasskeyError(options)) return options;
    let assertion: AuthenticationResponseJSON;
    try {
        assertion = await startAuthentication({ optionsJSON: options });
    } catch (err) {
        return { error: PASSKEY_ERR.aborted, message: (err as Error).message };
    }
    return postJSON<{ siteAccountId: string }>("/api/auth/site/passkey/authenticate/verify", {
        response: assertion,
    });
}
