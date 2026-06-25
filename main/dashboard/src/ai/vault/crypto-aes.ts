import { AES_NAME } from "./crypto-config.js";
import type { DerivedKey } from "./crypto-pbkdf2.js";
import { newIv } from "./crypto-iv.js";
import type { EncryptedBlob } from "./crypto-blob.js";

export { newIv } from "./crypto-iv.js";
export type { EncryptedBlob } from "./crypto-blob.js";

export async function encrypt(derived: DerivedKey, plaintext: string): Promise<EncryptedBlob> {
    const iv = newIv();
    const plainBytes = new TextEncoder().encode(plaintext) as unknown as BufferSource;
    const ciphertextBuf = await crypto.subtle.encrypt(
        { name: AES_NAME, iv: iv as unknown as BufferSource },
        derived.key,
        plainBytes,
    );
    return { iv, ciphertext: new Uint8Array(ciphertextBuf) };
}

export async function decrypt(derived: DerivedKey, blob: EncryptedBlob): Promise<string> {
    const plainBuf = await crypto.subtle.decrypt(
        { name: AES_NAME, iv: blob.iv as unknown as BufferSource },
        derived.key,
        blob.ciphertext as unknown as BufferSource,
    );
    return new TextDecoder().decode(plainBuf);
}
