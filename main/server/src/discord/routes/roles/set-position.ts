import { ClanAuditActions } from "../../../database/clans/audit/clan-audit-actions.js";
import { mutationRoute } from "../route-common/mutation-route.js";

import { registerMount } from "../_mount-registry.js";
import { TARGET_DISCORD_ROLE } from "../route-common/target-kinds.js";
interface SetPositionBody {
    userId: string;
    roleName: string;
    beforePosition: number;
    afterPosition: number;
}

const router = mutationRoute({
    method: "post",
    path: "/:guildId/:roleId/position",
    targetKind: TARGET_DISCORD_ROLE,
    opKind: "update",
    clansocketPermission: "discord:roles.set-position",
    rateLimitRoute: "/guilds/:id/roles",
    auditAction: ClanAuditActions.DiscordRolesSetPosition,
    failureCode: "set_role_position_failed",
    buildPayload: (req) => {
        const body = req.body as SetPositionBody;
        const roleId = req.params.roleId as string;
        const guildId = req.params.guildId as string;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: roleId,
            before: { subject: "position", position: body.beforePosition },
            after: { subject: "position", position: body.afterPosition },
            auditPayload: {
                guildId,
                targetName: body.roleName,
                beforePosition: body.beforePosition,
                afterPosition: body.afterPosition,
            },
        };
    },
});
registerMount("/roles", router);
export default router;
