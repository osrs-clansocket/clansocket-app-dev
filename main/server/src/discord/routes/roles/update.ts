import { ClanAuditActions } from "../../../database/clans/audit/clan-audit-actions.js";
import { updateAuditPayload } from "../route-common/audit-payloads.js";
import { mutationRoute } from "../route-common/mutation-route.js";

import { registerMount } from "../_mount-registry.js";
import { TARGET_DISCORD_ROLE } from "../route-common/target-kinds.js";
interface DiscordRoleState {
    name: string;
    color: number;
    hoist?: boolean;
    mentionable?: boolean;
    permissions: string;
}

interface UpdateRoleBody {
    userId: string;
    before: DiscordRoleState;
    after: DiscordRoleState;
}

const router = mutationRoute({
    method: "patch",
    path: "/:guildId/:roleId",
    targetKind: TARGET_DISCORD_ROLE,
    opKind: "update",
    clansocketPermission: "discord:roles.update",
    rateLimitRoute: "/guilds/:id/roles/:roleId",
    auditAction: ClanAuditActions.DiscordRolesUpdate,
    failureCode: "update_role_failed",
    buildPayload: (req) => {
        const body = req.body as UpdateRoleBody;
        const roleId = req.params.roleId as string;
        const guildId = req.params.guildId as string;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: roleId,
            before: body.before,
            after: body.after,
            auditPayload: updateAuditPayload(guildId, body.after.name, body.before, body.after),
        };
    },
});
registerMount("/roles", router);
export default router;
