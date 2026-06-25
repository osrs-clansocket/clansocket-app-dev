import { Events } from "discord.js";
import { registerListener } from "../../listener-registry.js";
import { pWebhook } from "../../specs/payloads.js";
import { syncWebhooksChannel } from "../../specs/persisters.js";
import { webhookGuard } from "../../specs/selectors-guards.js";

registerListener({
    event: Events.WebhooksUpdate,
    triggerId: "discord:webhooks.updated",
    selectEntity: webhookGuard,
    buildPayload: pWebhook,
    persist: syncWebhooksChannel,
});
