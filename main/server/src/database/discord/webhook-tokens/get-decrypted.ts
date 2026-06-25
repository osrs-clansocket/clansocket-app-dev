import { decryptToken } from "../../../crypto/aes-gcm-decrypter.js";
import { getMasterKey } from "../../../crypto/vault-key-loader.js";
import { discordGuildDb } from "../discord.js";

const SELECT_SQL = `SELECT encrypted_token_b64, token_iv_b64
    FROM discord_webhook_tokens
    WHERE webhook_id = ? AND revoked_at IS NULL`;

const TOUCH_SQL = `UPDATE discord_webhook_tokens SET last_used_at = ? WHERE webhook_id = ?`;

interface TokenRow {
    encrypted_token_b64: string;
    token_iv_b64: string;
}

export function decryptedWebhookToken(clanId: string, guildId: string, webhookId: string): string | null {
    const db = discordGuildDb(clanId, guildId);
    const row = db.prepare(SELECT_SQL).get(webhookId) as TokenRow | undefined;
    if (row === undefined) return null;
    let plaintext: string;
    try {
        plaintext = decryptToken(row.encrypted_token_b64, row.token_iv_b64, getMasterKey());
    } catch {
        return null;
    }
    db.prepare(TOUCH_SQL).run(Date.now(), webhookId);
    return plaintext;
}
