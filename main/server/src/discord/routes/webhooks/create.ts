import { randomUUID } from "node:crypto";
import { ClanAuditActions } from "../../../database/clans/audit/clan-audit-actions.js";
import { webhookAfter } from "../route-common/audit-payloads.js";
import { mutationRoute } from "../route-common/mutation-route.js";
import { PATH_GUILD } from "../route-common/route-paths.js";

import { registerMount } from "../_mount-registry.js";
import { TARGET_DISCORD_WEBHOOK } from "../route-common/target-kinds.js";
const WEBHOOK_TYPE_INCOMING = 1;

interface CreateWebhookBody {
    userId: string;
    channelId: string;
    name: string;
    avatarUrl?: string | null;
}

const router = mutationRoute({
    method: "post",
    path: PATH_GUILD,
    targetKind: TARGET_DISCORD_WEBHOOK,
    opKind: "create",
    clansocketPermission: "discord:webhooks.create",
    rateLimitRoute: "/channels/:id/webhooks",
    auditAction: ClanAuditActions.DiscordWebhooksCreate,
    failureCode: "webhook_create_failed",
    buildPayload: (req) => {
        const body = req.body as CreateWebhookBody;
        const guildId = req.params.guildId as string;
        const tempId = `temp:${randomUUID()}`;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: tempId,
            after: webhookAfter(body.name, body.channelId, body.avatarUrl),
            auditPayload: {
                guildId,
                targetName: body.name,
                channelId: body.channelId,
                webhookType: WEBHOOK_TYPE_INCOMING,
            },
            responseExtras: { tempId },
        };
    },
});
registerMount("/webhooks", router);
export default router;
