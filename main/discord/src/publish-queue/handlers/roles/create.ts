import { PermissionsBitField, type Guild } from "discord.js";
import { registerPublisher } from "../../publisher-registry.js";
import { OP_KINDS, ENTITY_TYPES } from "../../publish-vocab.js";
import { runPublishOp } from "../../runners/op-runner.js";
import { toDiscordRole } from "./update.js";

interface RoleCreateState {
    name: string;
    color: number;
    hoist: boolean;
    mentionable: boolean;
    permissions: string;
}

export async function applyRoleCreate(guild: Guild, data: RoleCreateState): Promise<string> {
    const role = await guild.roles.create(toDiscordRole(data));
    return role.id;
}

export type { RoleCreateState };

registerPublisher(OP_KINDS.CREATE, ENTITY_TYPES.ROLE, {
    handler: (c, r) => runPublishOp(c, r, OP_KINDS.CREATE, (g, d) => applyRoleCreate(g, d as RoleCreateState)),
    requiredBotPermission: PermissionsBitField.Flags.ManageRoles,
});
