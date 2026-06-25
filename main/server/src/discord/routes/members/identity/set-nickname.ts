import { ClanAuditActions } from "../../../../database/clans/audit/clan-audit-actions.js";
import { mutationRoute } from "../../route-common/mutation-route.js";

import { registerMount } from "../../_mount-registry.js";
import { TARGET_DISCORD_MEMBER } from "../../route-common/target-kinds.js";
interface SetNicknameBody {
    userId: string;
    targetUserId: string;
    targetUserName: string;
    beforeNickname: string | null;
    nickname: string | null;
}

const router = mutationRoute({
    method: "patch",
    path: "/:guildId/:userId/nickname",
    targetKind: TARGET_DISCORD_MEMBER,
    opKind: "update",
    clansocketPermission: "discord:members.set-nickname",
    rateLimitRoute: "/guilds/:id/members/:user_id",
    auditAction: ClanAuditActions.DiscordMembersSetNickname,
    failureCode: "set_nickname_failed",
    buildPayload: (req) => {
        const body = req.body as SetNicknameBody;
        const targetUserId = req.params.userId as string;
        const guildId = req.params.guildId as string;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: targetUserId,
            after: { subject: "nickname", nickname: body.nickname, targetUserId },
            auditPayload: {
                guildId,
                userId: targetUserId,
                userName: body.targetUserName,
                beforeNickname: body.beforeNickname,
                afterNickname: body.nickname,
            },
        };
    },
});
registerMount("/members", router);
export default router;
