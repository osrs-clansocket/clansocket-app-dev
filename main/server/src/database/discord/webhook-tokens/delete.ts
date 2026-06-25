import { discordGuildDb } from "../discord.js";

const REVOKE_SQL = `UPDATE discord_webhook_tokens
    SET revoked_at = ?
    WHERE webhook_id = ? AND revoked_at IS NULL`;

export function deleteWebhookToken(clanId: string, guildId: string, webhookId: string): boolean {
    const db = discordGuildDb(clanId, guildId);
    const info = db.prepare(REVOKE_SQL).run(Date.now(), webhookId);
    return info.changes > 0;
}
