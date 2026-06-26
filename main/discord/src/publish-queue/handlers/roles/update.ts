import { PermissionsBitField, type Guild } from "discord.js";
import { orThrow } from "../../../shared/nullable.js";
import { registerPublisher } from "../../publisher-registry.js";
import { OP_KINDS, ENTITY_TYPES } from "../../publish-vocab.js";
import { runPublishOp } from "../../runners/op-runner.js";
import { dispatcherBySubject } from "../../../shared/subject-dispatcher.js";

const SUBJECT_POSITION = "position";
const SUBJECT_PERMISSIONS = "permissions";

export interface RoleEditState {
    name?: string;
    color?: number;
    hoist?: boolean;
    mentionable?: boolean;
    permissions?: string;
}

export function toDiscordRole(data: RoleEditState) {
    return {
        name: data.name,
        color: data.color,
        hoist: data.hoist,
        mentionable: data.mentionable,
        permissions: data.permissions === undefined ? undefined : BigInt(data.permissions),
    };
}

interface RolePositionState {
    subject: typeof SUBJECT_POSITION;
    position: number;
}

interface RolePermissionsState {
    subject: typeof SUBJECT_PERMISSIONS;
    permissions: string;
}

async function fetchRole(guild: Guild, roleId: string) {
    return orThrow(await guild.roles.fetch(roleId), `role ${roleId} not found`);
}

const SUBJECT_APPLIERS: Record<string, (guild: Guild, roleId: string, data: any) => Promise<unknown>> = {
    [SUBJECT_POSITION]: async (g, id, d: RolePositionState) => (await fetchRole(g, id)).setPosition(d.position),
    [SUBJECT_PERMISSIONS]: async (g, id, d: RolePermissionsState) =>
        (await fetchRole(g, id)).setPermissions(BigInt(d.permissions)),
};

async function applyRoleEdit(guild: Guild, roleId: string, data: RoleEditState): Promise<void> {
    const role = await fetchRole(guild, roleId);
    await role.edit(toDiscordRole(data));
}

export const applyRoleUpdate = dispatcherBySubject<RoleEditState>(SUBJECT_APPLIERS, applyRoleEdit);

registerPublisher(OP_KINDS.UPDATE, ENTITY_TYPES.ROLE, {
    handler: (c, r) =>
        runPublishOp(c, r, OP_KINDS.UPDATE, (g, d) =>
            applyRoleUpdate(g, r.target_id_or_temp, d as Record<string, unknown>),
        ),
    requiredBotPermission: PermissionsBitField.Flags.ManageRoles,
});
