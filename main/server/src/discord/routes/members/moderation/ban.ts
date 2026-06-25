import { ClanAuditActions } from "../../../../database/clans/audit/clan-audit-actions.js";
import { mutationRoute } from "../../route-common/mutation-route.js";

import { registerMount } from "../../_mount-registry.js";
import { TARGET_DISCORD_MEMBER } from "../../route-common/target-kinds.js";
interface BanBody {
    userId: string;
    targetUserName: string;
    reason?: string;
    deleteMessageDays?: number;
}

const router = mutationRoute({
    method: "post",
    path: "/:guildId/:userId/ban",
    targetKind: TARGET_DISCORD_MEMBER,
    opKind: "delete",
    clansocketPermission: "discord:members.ban",
    rateLimitRoute: "/guilds/:id/bans/:user_id",
    auditAction: ClanAuditActions.DiscordMembersBan,
    failureCode: "ban_failed",
    buildPayload: (req) => {
        const body = req.body as BanBody;
        const targetUserId = req.params.userId as string;
        const guildId = req.params.guildId as string;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: targetUserId,
            after: {
                subject: "ban",
                reason: body.reason ?? null,
                deleteMessageDays: body.deleteMessageDays ?? null,
                targetUserId,
            },
            auditPayload: {
                guildId,
                userId: targetUserId,
                userName: body.targetUserName,
                reason: body.reason,
                deleteMessageDays: body.deleteMessageDays,
            },
        };
    },
});
registerMount("/members", router);
export default router;
