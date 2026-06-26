import { SQL_TABLES } from "../../../database/core/sql-columns.js";
import { listWebhooksGuild } from "../../../database/discord/state/webhooks/list-webhooks.js";
import type { ProjectionTopic } from "../projection-types.js";
import { guildTopic, singleKeyOf } from "./guild-topic-builder.js";

export function discordWebhooksTopic(clanId: string, guildId: string): ProjectionTopic {
    return guildTopic({
        clanId,
        guildId,
        tables: [SQL_TABLES.DISCORD_WEBHOOKS],
        loader: listWebhooksGuild,
        keyOf: singleKeyOf("webhook_id"),
    });
}
