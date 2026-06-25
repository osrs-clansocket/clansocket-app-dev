import { PermissionsBitField, type Guild } from "discord.js";
import { registerPublisher } from "../../publisher-registry.js";
import { runPublishOp } from "../../runners/op-runner.js";

interface UpdateWebhookState {
    name: string | null;
    channelId: string;
    avatarUrl: string | null;
}

export async function applyWebhookUpdate(guild: Guild, webhookId: string, data: UpdateWebhookState): Promise<void> {
    const all = await guild.fetchWebhooks();
    const webhook = all.get(webhookId);
    if (!webhook) throw new Error(`webhook ${webhookId} not found`);
    await webhook.edit({
        name: data.name ?? undefined,
        channel: data.channelId,
        avatar: data.avatarUrl ?? undefined,
    });
}

registerPublisher("update", "discord_webhook", {
    handler: (c, r) =>
        runPublishOp(c, r, "update", (g, d) => applyWebhookUpdate(g, r.target_id_or_temp, d as UpdateWebhookState)),
    requiredBotPermission: PermissionsBitField.Flags.ManageWebhooks,
});
