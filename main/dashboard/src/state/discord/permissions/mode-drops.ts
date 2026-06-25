import { listChannels, listRoles, memberDisplayOr, roleNameOr } from "../guild-state-cache.js";
import { addPermissionOverride } from "../../../dom/discord/inspector/util/permission-cycle.js";
import {
    EVERYONE_NAME,
    type PermissionsCtx,
} from "../../../dom/pages/clans/manage/discord/modes/permissions/mode-constants.js";

export async function handleRoleDrop(ctx: PermissionsCtx, swatchKind: string, id: string, bit: number): Promise<void> {
    if (swatchKind !== "role" && swatchKind !== "member") return;
    const channels = listChannels(ctx.guildId);
    if (channels.length === 0) return;
    const tName = swatchKind === "role" ? roleNameOr(ctx.guildId, id, id) : memberDisplayOr(ctx.guildId, id, id);
    await addPermissionOverride({
        bit,
        guildId: ctx.guildId,
        existing: ctx.getLatest(),
        channelId: channels[0].channel_id,
        kind: swatchKind,
        targetId: id,
        targetName: tName,
        branch: "allow",
    });
}

export async function handleChannelDrop(
    ctx: PermissionsCtx,
    swatchKind: string,
    id: string,
    bit: number,
): Promise<void> {
    if (swatchKind !== "channel") return;
    const roles = listRoles(ctx.guildId);
    const everyone = roles.find((r) => r.name === EVERYONE_NAME) ?? roles[0];
    if (!everyone) return;
    await addPermissionOverride({
        bit,
        guildId: ctx.guildId,
        existing: ctx.getLatest(),
        channelId: id,
        kind: "role",
        targetId: everyone.role_id,
        targetName: everyone.name,
        branch: "allow",
    });
}
