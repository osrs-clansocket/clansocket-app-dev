import { type Instance } from "../../../../factory";
import { identityStore } from "../../../../../state/identity/stores/identity-store.js";
import { updateDiscordRole, type DiscordRole, type DiscordRoleState } from "../../../../../state/discord/client.js";
import { roleStateOf } from "../../../../../state/discord/roles/mappers/role-mapper.js";
import {
    editCheck,
    editColor,
    editText,
    imagePreview,
    editPerms,
    buildReadonlySection,
} from "../../builders/section-builder.js";

const HEX_PADDING = 6;
const HEX_RADIX = 16;

function intToHex(n: number): string {
    return `#${n.toString(HEX_RADIX).padStart(HEX_PADDING, "0")}`;
}

async function saveRolePatch(role: DiscordRole, patch: Partial<DiscordRoleState>): Promise<void> {
    const session = identityStore.session$();
    if (session === null) return;
    const before = roleStateOf(role);
    const after: DiscordRoleState = { ...before, ...patch };
    await updateDiscordRole(role.guild_id, role.role_id, {
        userId: session.id,
        before,
        after,
    });
}

function nameSection(role: DiscordRole, editable: boolean): Instance {
    if (editable) return editText("Name", role.name, (next) => void saveRolePatch(role, { name: next }));
    return buildReadonlySection({ title: "Name", value: role.name });
}

function colorSection(role: DiscordRole, editable: boolean): Instance {
    if (!editable) return buildReadonlySection({ title: "Color", value: intToHex(role.color) });
    return editColor("Color", intToHex(role.color), (nextHex) => {
        const colorInt = parseInt(nextHex.replace("#", ""), HEX_RADIX);
        if (Number.isNaN(colorInt)) return;
        void saveRolePatch(role, { color: colorInt });
    });
}

function boolSections(role: DiscordRole, editable: boolean): Instance[] {
    if (editable) {
        return [
            editCheck("Display separately", role.hoist, (next) => void saveRolePatch(role, { hoist: next })),
            editCheck("Mentionable", role.mentionable, (next) => void saveRolePatch(role, { mentionable: next })),
        ];
    }
    return [
        buildReadonlySection({ title: "Display separately", value: role.hoist ? "yes" : "no" }),
        buildReadonlySection({ title: "Mentionable", value: role.mentionable ? "yes" : "no" }),
    ];
}

export function roleSections(role: DiscordRole): Instance[] {
    const editable = !role.managed;
    return [
        nameSection(role, editable),
        buildReadonlySection({ title: "ID", value: role.role_id }),
        colorSection(role, editable),
        buildReadonlySection({ title: "Position", value: String(role.position) }),
        editPerms("Permissions", role.permissions, editable, (next) => void saveRolePatch(role, { permissions: next })),
        ...boolSections(role, editable),
        buildReadonlySection({ title: "Managed", value: role.managed ? "yes" : "no" }),
        imagePreview("Role icon URL", role.icon_url),
        buildReadonlySection({ title: "Unicode emoji icon", value: role.unicode_emoji ?? "—" }),
    ];
}
