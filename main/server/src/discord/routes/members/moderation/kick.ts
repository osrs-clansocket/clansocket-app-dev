import { ClanAuditActions } from "../../../../database/clans/audit/clan-audit-actions.js";
import { moderationAfter, moderationAuditPayload } from "../../route-common/audit-payloads.js";
import { mutationRoute } from "../../route-common/mutation-route.js";

import { registerMount } from "../../_mount-registry.js";
import { TARGET_DISCORD_MEMBER } from "../../route-common/target-kinds.js";
interface KickBody {
    userId: string;
    targetUserName: string;
    reason?: string;
}

const router = mutationRoute({
    method: "post",
    path: "/:guildId/:userId/kick",
    targetKind: TARGET_DISCORD_MEMBER,
    opKind: "delete",
    clansocketPermission: "discord:members.kick",
    rateLimitRoute: "/guilds/:id/members/:user_id",
    auditAction: ClanAuditActions.DiscordMembersKick,
    failureCode: "kick_failed",
    buildPayload: (req) => {
        const body = req.body as KickBody;
        const targetUserId = req.params.userId as string;
        const guildId = req.params.guildId as string;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: targetUserId,
            after: moderationAfter("kick", targetUserId, body.reason),
            auditPayload: moderationAuditPayload(guildId, targetUserId, body.targetUserName, body.reason),
        };
    },
});
registerMount("/members", router);
export default router;
