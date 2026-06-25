import { ClanAuditActions } from "../../../../database/clans/audit/clan-audit-actions.js";
import { mutationRoute } from "../../route-common/mutation-route.js";
import { MOUNT_MEMBERS } from "../../route-common/route-paths.js";

import { registerMount } from "../../_mount-registry.js";
import { TARGET_DISCORD_MEMBER } from "../../route-common/target-kinds.js";
interface TimeoutBody {
    userId: string;
    targetUserName: string;
    beforeCommunicationDisabledUntil: number | null;
    communicationDisabledUntil: number | null;
    reason?: string;
}

const router = mutationRoute({
    method: "post",
    path: "/:guildId/:userId/timeout",
    targetKind: TARGET_DISCORD_MEMBER,
    opKind: "update",
    clansocketPermission: "discord:members.timeout",
    rateLimitRoute: "/guilds/:id/members/:user_id",
    auditAction: ClanAuditActions.DiscordMembersTimeout,
    failureCode: "timeout_failed",
    buildPayload: (req) => {
        const body = req.body as TimeoutBody;
        const targetUserId = req.params.userId as string;
        const guildId = req.params.guildId as string;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: targetUserId,
            after: {
                subject: "timeout",
                communicationDisabledUntil: body.communicationDisabledUntil,
                reason: body.reason ?? null,
                targetUserId,
            },
            auditPayload: {
                guildId,
                userId: targetUserId,
                userName: body.targetUserName,
                beforeCommunicationDisabledUntil: body.beforeCommunicationDisabledUntil,
                afterCommunicationDisabledUntil: body.communicationDisabledUntil,
                reason: body.reason,
            },
        };
    },
});
registerMount(MOUNT_MEMBERS, router);
export default router;
