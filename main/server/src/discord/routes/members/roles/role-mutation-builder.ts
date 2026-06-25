import type { Request, Router } from "express";
import { ClanAuditActions, type ClanAuditAction } from "../../../../database/clans/audit/clan-audit-actions.js";
import { mutationRoute, type HttpMethod, type MutationBuiltPayload } from "../../route-common/mutation-route.js";
import { MOUNT_MEMBERS } from "../../route-common/route-paths.js";
import { registerMount } from "../../_mount-registry.js";
import { TARGET_DISCORD_MEMBER } from "../../route-common/target-kinds.js";

interface RoleMutationBody {
    userId: string;
    targetUserName: string;
    roleName: string;
}

interface RoleVerb {
    verb: "add" | "remove";
    method: HttpMethod;
    auditAction: ClanAuditAction;
}

const VERBS: Record<"add" | "remove", RoleVerb> = {
    add: { verb: "add", method: "post", auditAction: ClanAuditActions.DiscordMembersAddRole },
    remove: { verb: "remove", method: "delete", auditAction: ClanAuditActions.DiscordMembersRemoveRole },
};

function buildRolePayload(req: Request, verb: "add" | "remove"): MutationBuiltPayload {
    const body = req.body as RoleMutationBody;
    const targetUserId = req.params.userId as string;
    const roleId = req.params.roleId as string;
    const guildId = req.params.guildId as string;
    return {
        actorUserId: body.userId,
        targetIdOrTemp: targetUserId,
        after: { subject: `${verb}-role`, targetUserId, roleId },
        auditPayload: {
            userId: targetUserId,
            userName: body.targetUserName,
            roleName: body.roleName,
            guildId,
            roleId,
        },
    };
}

export function defineRoleMutation(verbKey: "add" | "remove"): Router {
    const v = VERBS[verbKey];
    const router = mutationRoute({
        method: v.method,
        path: "/:guildId/:userId/roles/:roleId",
        targetKind: TARGET_DISCORD_MEMBER,
        opKind: "update",
        clansocketPermission: `discord:members.${v.verb}-role`,
        rateLimitRoute: "/guilds/:id/members/:user_id/roles/:role_id",
        auditAction: v.auditAction,
        failureCode: `${v.verb}_role_failed`,
        buildPayload: (req) => buildRolePayload(req, v.verb),
    });
    registerMount(MOUNT_MEMBERS, router);
    return router;
}
