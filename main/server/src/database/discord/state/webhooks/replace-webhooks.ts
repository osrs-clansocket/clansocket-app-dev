import { withGuildTx } from "../../discord.js";
import type { WebhookRow } from "../types.js";
import { upsertWebhook } from "./upsert-webhook.js";

const DELETE_CHANNEL_SCOPED_SQL = `DELETE FROM discord_webhooks WHERE guild_id = ? AND channel_id = ?`;

export function replaceWebhooksChannel(
    clanId: string,
    guildId: string,
    channelId: string,
    rows: readonly WebhookRow[],
): void {
    withGuildTx(clanId, guildId, (db) => {
        db.prepare(DELETE_CHANNEL_SCOPED_SQL).run(guildId, channelId);
        for (const row of rows) upsertWebhook(clanId, guildId, row);
    });
}
