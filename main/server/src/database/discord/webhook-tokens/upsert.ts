import { encryptToken } from "../../../crypto/aes-gcm-encrypter.js";
import { getMasterKey } from "../../../crypto/vault-key-loader.js";
import { discordGuildDb } from "../discord.js";

const UPSERT_SQL = `INSERT INTO discord_webhook_tokens
    (webhook_id, webhook_name, guild_id, channel_id, channel_name, encrypted_token_b64, token_iv_b64,
     acquired_by_bot_id, acquired_by_bot_name, bound_by_site_account_id, bound_by_site_account_name, bound_at, updated_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(webhook_id) DO UPDATE SET
    webhook_name = excluded.webhook_name,
    channel_id = excluded.channel_id,
    channel_name = excluded.channel_name,
    encrypted_token_b64 = excluded.encrypted_token_b64,
    token_iv_b64 = excluded.token_iv_b64,
    acquired_by_bot_id = excluded.acquired_by_bot_id,
    acquired_by_bot_name = excluded.acquired_by_bot_name,
    revoked_at = NULL,
    updated_at = excluded.updated_at`;

export interface WebhookTokenInput {
    clanId: string;
    guildId: string;
    webhookId: string;
    webhookName: string | null;
    channelId: string;
    channelName: string | null;
    plaintextToken: string;
    acquiredByBotId: string | null;
    acquiredByBotName: string | null;
    boundBySiteAccountId: string | null;
    boundBySiteAccountName: string | null;
}

export function upsertWebhookToken(input: WebhookTokenInput): void {
    const { b64, iv } = encryptToken(input.plaintextToken, getMasterKey());
    const db = discordGuildDb(input.clanId, input.guildId);
    const now = Date.now();
    db.prepare(UPSERT_SQL).run(
        input.webhookId,
        input.webhookName,
        input.guildId,
        input.channelId,
        input.channelName,
        b64,
        iv,
        input.acquiredByBotId,
        input.acquiredByBotName,
        input.boundBySiteAccountId,
        input.boundBySiteAccountName,
        now,
        now,
    );
}
