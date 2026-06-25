import { PermissionsBitField, type Guild } from "discord.js";
import { assertWebhookCapable } from "../../../state-sync/webhooks/webhook-capable-guard.js";
import { registerPublisher } from "../../publisher-registry.js";
import { runPublishOp } from "../../runners/op-runner.js";

interface CreateWebhookState {
    channelId: string;
    name: string;
    avatarUrl: string | null;
}

export async function applyWebhookCreate(guild: Guild, data: CreateWebhookState): Promise<string> {
    const channel = await guild.channels.fetch(data.channelId);
    assertWebhookCapable(channel, `channel ${data.channelId} not webhook-capable`);
    const webhook = await channel.createWebhook({
        name: data.name,
        avatar: data.avatarUrl ?? undefined,
    });
    return webhook.id;
}

export type { CreateWebhookState };

registerPublisher("create", "discord_webhook", {
    handler: (c, r) => runPublishOp(c, r, "create", (g, d) => applyWebhookCreate(g, d as CreateWebhookState)),
    requiredBotPermission: PermissionsBitField.Flags.ManageWebhooks,
});
