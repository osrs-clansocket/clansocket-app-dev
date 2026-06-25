import { discordGuildDb } from "../../discord.js";

const SELECT_SQL = `SELECT name FROM discord_webhooks WHERE webhook_id = ?`;

export function webhookName(clanId: string, guildId: string, webhookId: string): string | null {
    const db = discordGuildDb(clanId, guildId);
    const row = db.prepare(SELECT_SQL).get(webhookId) as { name: string | null } | undefined;
    return row?.name ?? null;
}
