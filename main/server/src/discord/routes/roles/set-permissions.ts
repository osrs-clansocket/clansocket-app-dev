import { ClanAuditActions } from "../../../database/clans/audit/clan-audit-actions.js";
import { mutationRoute } from "../route-common/mutation-route.js";

import { registerMount } from "../_mount-registry.js";
import { TARGET_DISCORD_ROLE } from "../route-common/target-kinds.js";
interface SetPermsBody {
    userId: string;
    roleName: string;
    beforePermissions: string;
    afterPermissions: string;
}

const router = mutationRoute({
    method: "post",
    path: "/:guildId/:roleId/permissions",
    targetKind: TARGET_DISCORD_ROLE,
    opKind: "update",
    clansocketPermission: "discord:roles.set-permissions",
    rateLimitRoute: "/guilds/:id/roles/:roleId",
    auditAction: ClanAuditActions.DiscordRolesSetPermissions,
    failureCode: "set_role_permissions_failed",
    buildPayload: (req) => {
        const body = req.body as SetPermsBody;
        const roleId = req.params.roleId as string;
        const guildId = req.params.guildId as string;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: roleId,
            before: { subject: "permissions", permissions: body.beforePermissions },
            after: { subject: "permissions", permissions: body.afterPermissions },
            auditPayload: {
                guildId,
                targetName: body.roleName,
                beforePermissions: body.beforePermissions,
                afterPermissions: body.afterPermissions,
            },
        };
    },
});
registerMount("/roles", router);
export default router;
