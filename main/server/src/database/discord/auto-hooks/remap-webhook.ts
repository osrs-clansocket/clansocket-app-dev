import { discordGuildDb } from "../discord.js";

const REMAP_SQL = `UPDATE discord_auto_hooks SET webhook_id = ? WHERE webhook_id = ?`;

export function remapWebhook(clanId: string, guildId: string, oldWebhookId: string, newWebhookId: string): number {
    const db = discordGuildDb(clanId, guildId);
    const info = db.prepare(REMAP_SQL).run(newWebhookId, oldWebhookId);
    return info.changes;
}
