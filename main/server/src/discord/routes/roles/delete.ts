import { ClanAuditActions } from "../../../database/clans/audit/clan-audit-actions.js";
import { mutationRoute } from "../route-common/mutation-route.js";

import { registerMount } from "../_mount-registry.js";
import { TARGET_DISCORD_ROLE } from "../route-common/target-kinds.js";
interface DeleteRoleBody {
    userId: string;
    roleName: string;
}

const router = mutationRoute({
    method: "delete",
    path: "/:guildId/:roleId",
    targetKind: TARGET_DISCORD_ROLE,
    opKind: "delete",
    clansocketPermission: "discord:roles.delete",
    rateLimitRoute: "/guilds/:id/roles/:roleId",
    auditAction: ClanAuditActions.DiscordRolesDelete,
    failureCode: "delete_role_failed",
    buildPayload: (req) => {
        const body = req.body as DeleteRoleBody;
        const roleId = req.params.roleId as string;
        const guildId = req.params.guildId as string;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: roleId,
            before: { name: body.roleName },
            auditPayload: { guildId, targetName: body.roleName },
        };
    },
});
registerMount("/roles", router);
export default router;
