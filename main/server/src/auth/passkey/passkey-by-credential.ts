import { DB_NAMES, getDb } from "../../database/index.js";
import type { PasskeyRow } from "./passkey-store.js";

export function passkeyByCredential(credentialId: string): PasskeyRow | null {
    const db = getDb(DB_NAMES.APP);
    const row = db
        .prepare(
            `SELECT id, site_account_id, credential_id, public_key, sign_count, device_name, created_at, last_used_at
             FROM clansocket_passkeys WHERE credential_id = ?`,
        )
        .get(credentialId) as PasskeyRow | undefined;
    return row ?? null;
}
