import type { AuthenticatorTransportFuture, WebAuthnCredential } from "@simplewebauthn/server";
import type { PasskeyRow } from "./passkey-types.js";

export function passkeyCredential(passkey: PasskeyRow): WebAuthnCredential {
    return {
        id: passkey.credential_id,
        publicKey: Uint8Array.from(passkey.public_key) as unknown as WebAuthnCredential["publicKey"],
        counter: passkey.sign_count,
        transports: undefined as unknown as AuthenticatorTransportFuture[] | undefined,
    };
}
