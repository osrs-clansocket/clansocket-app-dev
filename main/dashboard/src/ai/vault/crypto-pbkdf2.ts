import { AES_KEY_BITS, AES_NAME, KEY_EXTRACTABLE, PBKDF2_HASH, PBKDF2_ITERATIONS } from "./crypto-config.js";
import type { DerivedKey } from "./crypto-key.js";
import { passphraseBytes } from "./crypto-passphrase.js";

export { newSalt } from "./crypto-salt.js";
export type { DerivedKey } from "./crypto-key.js";

export const DEFAULT_ITERATIONS = PBKDF2_ITERATIONS;

async function importMaterial(passphrase: string): Promise<CryptoKey> {
    return crypto.subtle.importKey("raw", passphraseBytes(passphrase), { name: "PBKDF2" }, false, ["deriveKey"]);
}

export async function deriveKey(passphrase: string, salt: Uint8Array, iterations: number): Promise<DerivedKey> {
    const baseKey = await importMaterial(passphrase);
    const key = await crypto.subtle.deriveKey(
        { iterations, name: "PBKDF2", salt: salt as unknown as BufferSource, hash: PBKDF2_HASH },
        baseKey,
        { name: AES_NAME, length: AES_KEY_BITS },
        KEY_EXTRACTABLE,
        ["encrypt", "decrypt"],
    );
    return { key };
}
