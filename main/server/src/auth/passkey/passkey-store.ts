import { randomUUID } from "node:crypto";
import { DB_NAMES, getDb } from "../../database/index.js";
import type { PasskeyRow } from "./passkey-types.js";

export type { PasskeyRow } from "./passkey-types.js";

export { passkeyCredential } from "./passkey-credential.js";
export { passkeyByCredential } from "./passkey-by-credential.js";

export function passkeyDescriptor(row: PasskeyRow): { id: string } {
    return { id: row.credential_id };
}

export function passkeyDeviceSummary(row: PasskeyRow): { deviceName: string | null; createdAt: number } {
    return { deviceName: row.device_name, createdAt: row.created_at };
}

export interface NewPasskey {
    siteAccountId: string;
    credentialId: string;
    publicKey: Buffer;
    deviceName: string | null;
}

export function insertPasskey(args: NewPasskey): PasskeyRow {
    const id = randomUUID();
    const now = Date.now();
    const db = getDb(DB_NAMES.APP);
    db.prepare(
        `INSERT INTO clansocket_passkeys (id, site_account_id, credential_id, public_key, sign_count, device_name, created_at)
         VALUES (?, ?, ?, ?, 0, ?, ?)`,
    ).run(id, args.siteAccountId, args.credentialId, args.publicKey, args.deviceName, now);
    return {
        id,
        site_account_id: args.siteAccountId,
        credential_id: args.credentialId,
        public_key: args.publicKey,
        sign_count: 0,
        device_name: args.deviceName,
        created_at: now,
        last_used_at: null,
    };
}

export function listPasskeysAccount(siteAccountId: string): PasskeyRow[] {
    const db = getDb(DB_NAMES.APP);
    return db
        .prepare(
            `SELECT id, site_account_id, credential_id, public_key, sign_count, device_name, created_at, last_used_at
             FROM clansocket_passkeys WHERE site_account_id = ?
             ORDER BY created_at DESC`,
        )
        .all(siteAccountId) as PasskeyRow[];
}

export function updateAfterAuth(id: string, newSignCount: number): void {
    const db = getDb(DB_NAMES.APP);
    db.prepare(`UPDATE clansocket_passkeys SET sign_count = ?, last_used_at = ? WHERE id = ?`).run(
        newSignCount,
        Date.now(),
        id,
    );
}

export function revokePasskey(id: string, siteAccountId: string): boolean {
    const db = getDb(DB_NAMES.APP);
    const result = db
        .prepare(`DELETE FROM clansocket_passkeys WHERE id = ? AND site_account_id = ?`)
        .run(id, siteAccountId);
    return result.changes > 0;
}

export function countPasskeysAccount(siteAccountId: string): number {
    const db = getDb(DB_NAMES.APP);
    const row = db
        .prepare(`SELECT COUNT(*) AS n FROM clansocket_passkeys WHERE site_account_id = ?`)
        .get(siteAccountId) as { n: number };
    return row.n;
}
