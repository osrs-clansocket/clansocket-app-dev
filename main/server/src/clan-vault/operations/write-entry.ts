import { encryptToken } from "../../crypto/aes-gcm-encrypter.js";
import { getMasterKey } from "../../crypto/vault-key-loader.js";
import { clanVaultDb } from "../../database/core/clans.js";
import { vaultEntryType } from "../registries/entry-type-registry.js";
import { assertActor, recordVaultAudit } from "../recorders/audit-recorder.js";
import type { Actor, PayloadValidator, WriteResult } from "../shared/vault-types.js";
import { assertWritable } from "./writable-actor.js";

const NOW = (): number => Date.now();

const UPSERT_SQL = `INSERT INTO vault_entries
    (entry_key, entry_type, schema_version, iv_b64, ciphertext_b64, set_by, set_at, updated_at)
VALUES ($entryKey, $entryType, $schemaVersion, $iv, $b64, $setBy, $now, $now)
ON CONFLICT(entry_key) DO UPDATE SET
    entry_type = excluded.entry_type,
    schema_version = excluded.schema_version,
    iv_b64 = excluded.iv_b64,
    ciphertext_b64 = excluded.ciphertext_b64,
    set_by = excluded.set_by,
    set_at = excluded.set_at,
    updated_at = excluded.updated_at`;

export interface WriteEntryArgs<T> {
    clanId: string;
    entry_key: string;
    entry_type: string;
    payload: T;
    actor: Actor;
    validate: PayloadValidator<T>;
}

interface SchemaViolationArgs {
    clanId: string;
    action: string;
    entry_key: string;
    actor: Actor;
    entry_type: string;
}

function auditSchemaViolation(a: SchemaViolationArgs): void {
    recordVaultAudit({
        clanId: a.clanId,
        action: a.action,
        entry_key: a.entry_key,
        actor: a.actor,
        extra: { reason: "schema-violation", entry_type: a.entry_type },
    });
}

interface PersistArgs {
    clanId: string;
    entry_key: string;
    entry_type: string;
    schemaVersion: number;
    plaintext: string;
    setBy: string;
}

function persistEntry(a: PersistArgs): void {
    const { b64, iv } = encryptToken(a.plaintext, getMasterKey());
    const db = clanVaultDb(a.clanId);
    db.prepare(UPSERT_SQL).run({
        iv,
        b64,
        entryKey: a.entry_key,
        entryType: a.entry_type,
        schemaVersion: a.schemaVersion,
        setBy: a.setBy,
        now: NOW(),
    });
}

export async function writeVaultEntry<T>(args: WriteEntryArgs<T>): Promise<WriteResult> {
    const { clanId, entry_key, entry_type, payload, actor, validate } = args;
    assertActor(actor);
    const registered = vaultEntryType(entry_key);
    if (registered === null) return { ok: false, reason: "unknown-entry-type" };
    if (!validate(payload)) {
        auditSchemaViolation({ clanId, entry_key, actor, entry_type, action: registered.auditActions.write });
        return { ok: false, reason: "schema-violation" };
    }
    const setBy = assertWritable(actor, clanId, entry_key);
    persistEntry({
        clanId,
        entry_key,
        entry_type,
        setBy,
        schemaVersion: registered.schema_version,
        plaintext: JSON.stringify(payload),
    });
    recordVaultAudit({ clanId, entry_key, actor, action: registered.auditActions.write, extra: { entry_type } });
    return { ok: true };
}
