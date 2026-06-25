import { ClanAuditActions } from "../../../database/clans/audit/clan-audit-actions.js";
import type { DiscordWebhookState } from "../../../database/clans/audit/clan-audit-registry/index.js";
import { updateAuditPayload, webhookAfter } from "../route-common/audit-payloads.js";
import { mutationRoute } from "../route-common/mutation-route.js";

import { registerMount } from "../_mount-registry.js";
import { TARGET_DISCORD_WEBHOOK } from "../route-common/target-kinds.js";
interface UpdateWebhookBody {
    userId: string;
    before: DiscordWebhookState;
    after: DiscordWebhookState;
}

const router = mutationRoute({
    method: "patch",
    path: "/:guildId/:webhookId",
    targetKind: TARGET_DISCORD_WEBHOOK,
    opKind: "update",
    clansocketPermission: "discord:webhooks.update",
    rateLimitRoute: "/webhooks/:id",
    auditAction: ClanAuditActions.DiscordWebhooksUpdate,
    failureCode: "webhook_update_failed",
    buildPayload: (req) => {
        const body = req.body as UpdateWebhookBody;
        const webhookId = req.params.webhookId as string;
        const guildId = req.params.guildId as string;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: webhookId,
            after: webhookAfter(body.after.name, body.after.channelId, body.after.avatarUrl),
            auditPayload: updateAuditPayload(guildId, body.after.name ?? "", body.before, body.after),
        };
    },
});
registerMount("/webhooks", router);
export default router;
