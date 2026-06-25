import { discordGuildDb } from "../../discord.js";
import type { WebhookRow } from "../types.js";
import { propagateWebhookName } from "./propagate-webhook-name.js";

const UPSERT_SQL = `
INSERT INTO discord_webhooks (
    webhook_id, guild_id, channel_id, channel_name, name, avatar_url,
    application_id, user_id, webhook_type,
    source_guild_id, source_guild_name, source_channel_id, source_channel_name,
    updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(webhook_id) DO UPDATE SET
    guild_id = excluded.guild_id,
    channel_id = excluded.channel_id,
    channel_name = excluded.channel_name,
    name = excluded.name,
    avatar_url = excluded.avatar_url,
    application_id = excluded.application_id,
    user_id = excluded.user_id,
    webhook_type = excluded.webhook_type,
    source_guild_id = excluded.source_guild_id,
    source_guild_name = excluded.source_guild_name,
    source_channel_id = excluded.source_channel_id,
    source_channel_name = excluded.source_channel_name,
    updated_at = excluded.updated_at
`;

export function upsertWebhook(clanId: string, guildId: string, row: WebhookRow): void {
    const db = discordGuildDb(clanId, guildId);
    db.prepare(UPSERT_SQL).run(
        row.webhook_id,
        row.guild_id,
        row.channel_id,
        row.channel_name,
        row.name,
        row.avatar_url,
        row.application_id,
        row.user_id,
        row.webhook_type,
        row.source_guild_id,
        row.source_guild_name,
        row.source_channel_id,
        row.source_channel_name,
        Date.now(),
    );
    propagateWebhookName(clanId, guildId, row.webhook_id, row.name);
}
