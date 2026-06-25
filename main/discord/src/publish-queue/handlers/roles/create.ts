import { PermissionsBitField, type Guild } from "discord.js";
import { registerPublisher } from "../../publisher-registry.js";
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

registerPublisher("create", "discord_role", {
    handler: (c, r) => runPublishOp(c, r, "create", (g, d) => applyRoleCreate(g, d as RoleCreateState)),
    requiredBotPermission: PermissionsBitField.Flags.ManageRoles,
});
