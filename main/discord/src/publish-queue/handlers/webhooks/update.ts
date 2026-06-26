import { PermissionsBitField, type Guild } from "discord.js";
import { orThrow } from "../../../shared/nullable.js";
import { registerPublisher } from "../../publisher-registry.js";
import { OP_KINDS, ENTITY_TYPES } from "../../publish-vocab.js";
import { runPublishOp } from "../../runners/op-runner.js";

interface UpdateWebhookState {
    name: string | null;
    channelId: string;
    avatarUrl: string | null;
}

export async function applyWebhookUpdate(guild: Guild, webhookId: string, data: UpdateWebhookState): Promise<void> {
    const all = await guild.fetchWebhooks();
    const webhook = orThrow(all.get(webhookId), `webhook ${webhookId} not found`);
    await webhook.edit({
        name: data.name ?? undefined,
        channel: data.channelId,
        avatar: data.avatarUrl ?? undefined,
    });
}

registerPublisher(OP_KINDS.UPDATE, ENTITY_TYPES.WEBHOOK, {
    handler: (c, r) =>
        runPublishOp(c, r, OP_KINDS.UPDATE, (g, d) =>
            applyWebhookUpdate(g, r.target_id_or_temp, d as UpdateWebhookState),
        ),
    requiredBotPermission: PermissionsBitField.Flags.ManageWebhooks,
});
