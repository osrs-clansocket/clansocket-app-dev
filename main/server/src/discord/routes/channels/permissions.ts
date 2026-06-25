import { ClanAuditActions } from "../../../database/clans/audit/clan-audit-actions.js";
import { mutationRoute } from "../route-common/mutation-route.js";
import { MOUNT_CHANNELS } from "../route-common/route-paths.js";

import { registerMount } from "../_mount-registry.js";
import { TARGET_DISCORD_CHANNEL } from "../route-common/target-kinds.js";
interface SetPermissionsBody {
    userId: string;
    channelName: string;
    overwriteKind: "role" | "member";
    overwriteTargetId: string;
    overwriteTargetName: string;
    allow: string;
    deny: string;
}

function buildPermissionsPayload(body: SetPermissionsBody, channelId: string, guildId: string) {
    return {
        actorUserId: body.userId,
        targetIdOrTemp: channelId,
        before: { subject: "permissions" },
        after: {
            subject: "permissions",
            overwriteKind: body.overwriteKind,
            overwriteTargetId: body.overwriteTargetId,
            allow: body.allow,
            deny: body.deny,
        },
        auditPayload: {
            guildId,
            targetName: body.channelName,
            overwriteKind: body.overwriteKind,
            overwriteTargetId: body.overwriteTargetId,
            overwriteTargetName: body.overwriteTargetName,
            allow: body.allow,
            deny: body.deny,
        },
    };
}

const router = mutationRoute({
    method: "post",
    path: "/:guildId/:channelId/permissions",
    targetKind: TARGET_DISCORD_CHANNEL,
    opKind: "update",
    clansocketPermission: "discord:channels.set-permissions",
    rateLimitRoute: "/channels/:id/permissions/:overwriteId",
    auditAction: ClanAuditActions.DiscordChannelsSetPermissions,
    failureCode: "set_channel_permissions_failed",
    buildPayload: (req) =>
        buildPermissionsPayload(
            req.body as SetPermissionsBody,
            req.params.channelId as string,
            req.params.guildId as string,
        ),
});
registerMount(MOUNT_CHANNELS, router);
export default router;
