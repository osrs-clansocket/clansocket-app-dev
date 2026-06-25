import { runGuildSql } from "../../discord.js";

const DELETE_SQL = `DELETE FROM discord_webhooks WHERE webhook_id = ? AND guild_id = ?`;

export function deleteWebhook(clanId: string, guildId: string, webhookId: string): void {
    runGuildSql(clanId, guildId, DELETE_SQL, webhookId, guildId);
}
