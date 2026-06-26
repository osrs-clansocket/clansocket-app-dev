import { PermissionsBitField, type Client } from "discord.js";
import { orThrow } from "../../../shared/nullable.js";
import type { PendingPublishRow } from "../../../loaders/publish-queue-loader.js";
import { registerPublisher } from "../../publisher-registry.js";
import { OP_KINDS, ENTITY_TYPES } from "../../publish-vocab.js";

export async function deleteWebhookHandler(
    client: Client,
    row: PendingPublishRow,
): Promise<{ snowflakeResolved: null }> {
    const guild = await client.guilds.fetch(row.guild_id);
    const all = await guild.fetchWebhooks();
    const webhook = orThrow(all.get(row.target_id_or_temp), `webhook ${row.target_id_or_temp} not found`);
    await webhook.delete();
    return { snowflakeResolved: null };
}

registerPublisher(OP_KINDS.DELETE, ENTITY_TYPES.WEBHOOK, {
    handler: deleteWebhookHandler,
    requiredBotPermission: PermissionsBitField.Flags.ManageWebhooks,
});
