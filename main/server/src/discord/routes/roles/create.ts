import { randomUUID } from "node:crypto";
import { ClanAuditActions } from "../../../database/clans/audit/clan-audit-actions.js";
import { mutationRoute } from "../route-common/mutation-route.js";
import { PATH_GUILD } from "../route-common/route-paths.js";

import { registerMount } from "../_mount-registry.js";
import { TARGET_DISCORD_ROLE } from "../route-common/target-kinds.js";
const DEFAULT_COLOR = 0;
const DEFAULT_HOIST = false;
const DEFAULT_MENTIONABLE = false;
const DEFAULT_PERMISSIONS = "0";

interface CreateRoleBody {
    userId: string;
    name: string;
    color?: number;
    hoist?: boolean;
    mentionable?: boolean;
    permissions?: string;
}

const router = mutationRoute({
    method: "post",
    path: PATH_GUILD,
    targetKind: TARGET_DISCORD_ROLE,
    opKind: "create",
    clansocketPermission: "discord:roles.create",
    rateLimitRoute: "/guilds/:id/roles",
    auditAction: ClanAuditActions.DiscordRolesCreate,
    failureCode: "create_role_failed",
    buildPayload: (req) => {
        const body = req.body as CreateRoleBody;
        const guildId = req.params.guildId as string;
        const tempId = `temp:${randomUUID()}`;
        const color = body.color ?? DEFAULT_COLOR;
        const hoist = body.hoist ?? DEFAULT_HOIST;
        const mentionable = body.mentionable ?? DEFAULT_MENTIONABLE;
        const permissions = body.permissions ?? DEFAULT_PERMISSIONS;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: tempId,
            after: { name: body.name, color, hoist, mentionable, permissions },
            auditPayload: { targetName: body.name, guildId, color, hoist, mentionable, permissions },
            responseExtras: { tempId },
        };
    },
});
registerMount("/roles", router);
export default router;
