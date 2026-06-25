import { ClanAuditActions } from "../../../../database/clans/audit/clan-audit-actions.js";
import { moderationAfter, moderationAuditPayload } from "../../route-common/audit-payloads.js";
import { mutationRoute } from "../../route-common/mutation-route.js";
import { MOUNT_MEMBERS } from "../../route-common/route-paths.js";

import { registerMount } from "../../_mount-registry.js";
import { TARGET_DISCORD_MEMBER } from "../../route-common/target-kinds.js";
interface UnbanBody {
    userId: string;
    targetUserName: string;
    reason?: string;
}

const router = mutationRoute({
    method: "delete",
    path: "/:guildId/:userId/ban",
    targetKind: TARGET_DISCORD_MEMBER,
    opKind: "create",
    clansocketPermission: "discord:members.unban",
    rateLimitRoute: "/guilds/:id/bans/:user_id",
    auditAction: ClanAuditActions.DiscordMembersUnban,
    failureCode: "unban_failed",
    buildPayload: (req) => {
        const body = req.body as UnbanBody;
        const targetUserId = req.params.userId as string;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: targetUserId,
            after: moderationAfter("unban", targetUserId, body.reason),
            auditPayload: moderationAuditPayload(
                req.params.guildId as string,
                targetUserId,
                body.targetUserName,
                body.reason,
            ),
        };
    },
});
registerMount(MOUNT_MEMBERS, router);
export default router;
