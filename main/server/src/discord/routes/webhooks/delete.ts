import { ClanAuditActions } from "../../../database/clans/audit/clan-audit-actions.js";
import { mutationRoute } from "../route-common/mutation-route.js";

import { registerMount } from "../_mount-registry.js";
import { TARGET_DISCORD_WEBHOOK } from "../route-common/target-kinds.js";
interface DeleteWebhookBody {
    userId: string;
    targetName: string;
    channelId: string;
}

const router = mutationRoute({
    method: "delete",
    path: "/:guildId/:webhookId",
    targetKind: TARGET_DISCORD_WEBHOOK,
    opKind: "delete",
    clansocketPermission: "discord:webhooks.delete",
    rateLimitRoute: "/webhooks/:id",
    auditAction: ClanAuditActions.DiscordWebhooksDelete,
    failureCode: "webhook_delete_failed",
    buildPayload: (req) => {
        const body = req.body as DeleteWebhookBody;
        const webhookId = req.params.webhookId as string;
        const guildId = req.params.guildId as string;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: webhookId,
            after: { channelId: body.channelId },
            auditPayload: { guildId, targetName: body.targetName, channelId: body.channelId },
        };
    },
});
registerMount("/webhooks", router);
export default router;
