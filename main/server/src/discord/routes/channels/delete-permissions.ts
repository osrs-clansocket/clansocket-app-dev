import { ClanAuditActions } from "../../../database/clans/audit/clan-audit-actions.js";
import { mutationRoute } from "../route-common/mutation-route.js";

import { registerMount } from "../_mount-registry.js";
import { TARGET_DISCORD_CHANNEL } from "../route-common/target-kinds.js";
interface DeletePermissionsBody {
    userId: string;
    targetName: string;
    overwriteKind: "role" | "member";
    overwriteTargetId: string;
    overwriteTargetName: string;
}

const router = mutationRoute({
    method: "delete",
    path: "/:guildId/:channelId/permissions/:overwriteTargetId",
    targetKind: TARGET_DISCORD_CHANNEL,
    opKind: "update",
    clansocketPermission: "discord:channels.delete-permissions",
    rateLimitRoute: "/channels/:id/permissions/:overwrite_id",
    auditAction: ClanAuditActions.DiscordChannelsDeletePermissions,
    failureCode: "delete_permissions_failed",
    buildPayload: (req) => {
        const body = req.body as DeletePermissionsBody;
        const channelId = req.params.channelId as string;
        const guildId = req.params.guildId as string;
        const overwriteTargetId = req.params.overwriteTargetId as string;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: channelId,
            after: {
                subject: "permissions-delete",
                overwriteKind: body.overwriteKind,
                overwriteTargetId,
            },
            auditPayload: {
                targetName: body.targetName,
                overwriteKind: body.overwriteKind,
                overwriteTargetName: body.overwriteTargetName,
                guildId,
                overwriteTargetId,
            },
        };
    },
});
registerMount("/channels", router);
export default router;
