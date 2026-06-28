import { registerValueSource } from "../../registries/value-source-registry.js";
import { queryAcrossGuilds } from "./multi-guild-query.js";

interface WebhookRow {
    webhook_id: string;
    name: string | null;
    channel_id: string;
    channel_name: string | null;
}

registerValueSource({
    format: "discord-webhook-id",
    label: "Discord webhooks",
    fetch: (clanId) =>
        queryAcrossGuilds<WebhookRow>(clanId, {
            sql: "SELECT webhook_id, name, channel_id, channel_name FROM discord_webhooks ORDER BY name",
            mapRow: (row, ctx) => {
                const label = row.name ?? row.channel_name ?? row.webhook_id;
                return { id: row.webhook_id, name: `${ctx.guildName} · ${label}` };
            },
        }),
});
