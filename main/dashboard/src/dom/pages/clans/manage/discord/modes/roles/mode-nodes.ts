import { icon, inlineConfirm, TREE_ICON_CLASS, type Instance, type TreeNode } from "../../../../../../factory";
import { roleStateOf } from "../../../../../../../state/discord/roles/mappers/role-mapper.js";
import { deleteDiscordRole, updateDiscordRole, type DiscordRole } from "../../../../../../../state/discord/client.js";
import { selectDiscordItem } from "../../../../../../../state/discord/inspector-selection.js";
import { identityStore } from "../../../../../../../state/identity/stores/identity-store.js";

const ROLE_ICON = "shield";
const MANAGED_ICON = "robot";

function iconForRole(role: DiscordRole): Instance {
    return icon({
        name: role.managed ? MANAGED_ICON : ROLE_ICON,
        classes: [TREE_ICON_CLASS],
        context: null,
        meta: null,
    });
}

function roleRenameHandler(role: DiscordRole, guildId: string): (next: string) => Promise<boolean> {
    return async (next) => {
        const session = identityStore.session$();
        if (session === null) return false;
        const before = roleStateOf(role);
        return updateDiscordRole(guildId, role.role_id, {
            before,
            userId: session.id,
            after: { ...before, name: next },
        });
    };
}

async function confirmRoleDelete(host: Instance, role: DiscordRole, guildId: string): Promise<void> {
    const ok = await inlineConfirm(host, {
        cancelLabel: "Cancel",
        confirmLabel: "Delete",
        danger: true,
        cancelContext: `keep role "${role.name}"`,
        confirmContext: `confirm deleting role "${role.name}"`,
    });
    if (!ok) return;
    const session = identityStore.session$();
    if (session === null) return;
    await deleteDiscordRole(guildId, role.role_id, {
        userId: session.id,
        roleName: role.name,
    });
}

function leafFor(role: DiscordRole, guildId: string, host: Instance): TreeNode {
    return {
        kind: "leaf",
        key: role.role_id,
        label: role.name,
        icon: iconForRole(role),
        title: `position ${role.position}`,
        onClick: () => selectDiscordItem({ kind: "role", data: role }),
        onLabelEdit: role.managed ? undefined : roleRenameHandler(role, guildId),
        actions: role.managed
            ? undefined
            : [
                  {
                      iconName: "trash",
                      title: `Delete ${role.name}`,
                      onClick: () => void confirmRoleDelete(host, role, guildId),
                      danger: true,
                  },
              ],
    };
}

export function buildRoleNodes(roles: readonly DiscordRole[], guildId: string, host: Instance): TreeNode[] {
    return [...roles].sort((a, b) => b.position - a.position).map((r) => leafFor(r, guildId, host));
}
