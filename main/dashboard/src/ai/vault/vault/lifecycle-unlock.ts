import { decrypt, deriveKey, type DerivedKey } from "../crypto";
import { VaultDecryptError, VaultMissingError } from "./errors.js";
import { readRecord } from "./storage.js";
import { VERIFIER_PLAINTEXT, type VaultRecord } from "./types.js";

async function loadAndDerive(passphrase: string): Promise<{ record: VaultRecord; derived: DerivedKey }> {
    const record = await readRecord();
    if (!record) throw new VaultMissingError();
    const derived = await deriveKey(passphrase, record.salt, record.iterations);
    return { record, derived };
}

export async function unlockVault(passphrase: string): Promise<DerivedKey> {
    const { record, derived } = await loadAndDerive(passphrase);
    try {
        const plaintext = await decrypt(derived, record.verifier);
        if (plaintext !== VERIFIER_PLAINTEXT) throw new VaultDecryptError();
    } catch {
        throw new VaultDecryptError();
    }
    return derived;
}
