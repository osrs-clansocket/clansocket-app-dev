import { registerValueSource } from "../../registries/value-source-registry.js";
import { queryAcrossGuilds } from "./multi-guild-query.js";

interface WebhookRow {
    webhook_id: string;
    name: string | null;
    channel_id: string;
}

registerValueSource({
    format: "discord-webhook-id",
    label: "Discord webhooks",
    fetch: (clanId) =>
        queryAcrossGuilds<WebhookRow>(clanId, {
            sql: "SELECT webhook_id, name, channel_id FROM discord_webhooks ORDER BY name",
            mapRow: (row) => ({ id: row.webhook_id, name: row.name ?? row.webhook_id }),
        }),
});
