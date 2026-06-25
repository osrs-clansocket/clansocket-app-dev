import { decryptToken } from "../../crypto/aes-gcm-decrypter.js";
import { getMasterKey } from "../../crypto/vault-key-loader.js";
import { clanVaultDb } from "../../database/core/clans.js";
import { vaultEntryType } from "../registries/entry-type-registry.js";
import { assertActor, recordVaultAudit } from "../recorders/audit-recorder.js";
import type { Actor, PayloadValidator, VaultRow } from "../shared/vault-types.js";

const NOW = (): number => Date.now();

interface FailureContext {
    clanId: string;
    action: string;
    entry_key: string;
    actor: Actor;
}

function auditMiss(ctx: FailureContext, reason: string | null): void {
    const extra = reason === null ? { hit: false } : { hit: true, reason };
    recordVaultAudit({ ...ctx, extra });
}

function tryDecrypt(row: VaultRow, ctx: FailureContext): string | null {
    try {
        return decryptToken(row.ciphertext_b64, row.iv_b64, getMasterKey());
    } catch {
        auditMiss(ctx, "decrypt-failed");
        return null;
    }
}

function tryParse(plaintext: string, ctx: FailureContext): unknown {
    try {
        return JSON.parse(plaintext);
    } catch {
        auditMiss(ctx, "parse-failed");
        return undefined;
    }
}

function decodeAndValidate<T>(row: VaultRow, ctx: FailureContext, validate: PayloadValidator<T>): T | null {
    const plaintext = tryDecrypt(row, ctx);
    if (plaintext === null) return null;
    const parsed = tryParse(plaintext, ctx);
    if (parsed === undefined) return null;
    if (!validate(parsed)) {
        auditMiss(ctx, "schema-violation");
        return null;
    }
    return parsed;
}

export async function readVaultEntry<T>(
    clanId: string,
    entry_key: string,
    actor: Actor,
    validate: PayloadValidator<T>,
): Promise<T | null> {
    assertActor(actor);
    const registered = vaultEntryType(entry_key);
    if (registered === null) return null;
    const db = clanVaultDb(clanId);
    const row = db.prepare("SELECT * FROM vault_entries WHERE entry_key = ?").get(entry_key) as VaultRow | undefined;
    const ctx: FailureContext = { clanId, entry_key, actor, action: registered.auditActions.read };
    if (row === undefined) {
        auditMiss(ctx, null);
        return null;
    }
    const parsed = decodeAndValidate(row, ctx, validate);
    if (parsed === null) return null;
    db.prepare("UPDATE vault_entries SET last_used_at = ? WHERE entry_key = ?").run(NOW(), entry_key);
    recordVaultAudit({ ...ctx, extra: { hit: true } });
    return parsed;
}
