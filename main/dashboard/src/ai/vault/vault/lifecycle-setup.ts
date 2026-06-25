import { DEFAULT_ITERATIONS, deriveKey, encrypt, newSalt, type DerivedKey } from "../crypto";
import { VaultPassphraseError } from "./errors.js";
import { writeRecord } from "./storage.js";
import { MIN_PASSPHRASE_LENGTH, VERIFIER_PLAINTEXT } from "./types.js";
import { vaultExists } from "./lifecycle-exists.js";

function validatePassphraseShape(passphrase: string): void {
    if (passphrase.trim().length < MIN_PASSPHRASE_LENGTH) {
        throw new VaultPassphraseError(`passphrase must be at least ${MIN_PASSPHRASE_LENGTH} characters`);
    }
}

export async function setupVault(passphrase: string): Promise<DerivedKey> {
    validatePassphraseShape(passphrase);
    if (await vaultExists()) {
        throw new VaultPassphraseError("vault already exists");
    }
    const salt = newSalt();
    const iterations = DEFAULT_ITERATIONS;
    const derived = await deriveKey(passphrase, salt, iterations);
    const verifierBlob = await encrypt(derived, VERIFIER_PLAINTEXT);
    const now = Date.now();
    await writeRecord({
        salt,
        iterations,
        verifier: { iv: verifierBlob.iv, ciphertext: verifierBlob.ciphertext },
        entries: {},
        priorityOrder: [],
        createdAt: now,
        updatedAt: now,
    });
    return derived;
}
