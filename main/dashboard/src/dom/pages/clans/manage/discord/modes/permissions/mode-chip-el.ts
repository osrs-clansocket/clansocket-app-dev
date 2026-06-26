import {
    BTN_VARIANT_BARE,
    button,
    div,
    icon,
    span,
    wireClick,
    type Instance,
    textProps,
} from "../../../../../../factory";
import {
    clearChannel,
    clearTarget,
    cycleChannelState,
    cycleTargetState,
    formatPermissionName,
    safeBigInt,
    targetIdOf,
} from "../../../../../../discord/inspector/util/permission-cycle.js";
import { listRoles } from "../../../../../../../state/discord/guild-state-cache.js";
import {
    CHIP_CLASS,
    CHIP_LABEL_CLASS,
    CHIP_MODIFIER_PREFIX,
    CHIP_REMOVE_CLASS,
    DATA_CHIP_CHANNEL,
    DATA_CHIP_TARGET,
    DATA_PERM_BIT,
    LOCK_ICON_NAME,
    LOCKED_MODIFIER,
    REMOVE_ICON_NAME,
    type ChannelChip,
    type PermissionsCtx,
    type RoleLevelChip,
    type TargetChip,
} from "./mode-constants.js";

function targetRemoveBtn(ctx: PermissionsCtx, t: TargetChip, bit: number, permLabel: string): Instance {
    return button(
        {
            classes: [CHIP_REMOVE_CLASS],
            variant: BTN_VARIANT_BARE,
            ariaLabel: `Remove ${t.kind} ${t.targetName} from ${permLabel}`,
            title: `clear all ${permLabel} overrides on ${t.kind} ${t.targetName}`,
            context: `clear ${permLabel} for ${t.kind} ${t.targetName}`,
            meta: ["action"],
            onClick: () => void clearTarget(ctx.getLatest(), t.kind, t.targetId, bit),
        },
        [icon({ name: REMOVE_ICON_NAME, classes: [], context: null, meta: null })],
    );
}

function wireChipCycle(ctx: PermissionsCtx, chip: Instance, t: TargetChip, bit: number): void {
    wireClick(chip.el, (e) => {
        if ((e.target as HTMLElement | null)?.closest(`.${CHIP_REMOVE_CLASS}`) !== null) return;
        void cycleTargetState({
            bit,
            existing: ctx.getLatest(),
            kind: t.kind,
            targetId: t.targetId,
            currentState: t.state,
        });
    });
}

export function targetChipEl(ctx: PermissionsCtx, t: TargetChip, bit: number, flagName: string): Instance {
    const permLabel = formatPermissionName(flagName);
    const chip = div(
        {
            classes: [CHIP_CLASS, `${CHIP_MODIFIER_PREFIX}${t.state}`],
            title: `${t.kind} ${t.targetName} (${t.state}) — click to cycle: allow → deny → inherit`,
            context: null,
            meta: null,
        },
        [span(textProps([CHIP_LABEL_CLASS], `${t.kind}: ${t.targetName}`)), targetRemoveBtn(ctx, t, bit, permLabel)],
    );
    chip.setAttr(DATA_PERM_BIT, String(bit));
    chip.setAttr(DATA_CHIP_TARGET, `${t.kind}:${t.targetId}`);
    wireChipCycle(ctx, chip, t, bit);
    return chip;
}

function channelRemoveBtn(ctx: PermissionsCtx, c: ChannelChip, bit: number, permLabel: string): Instance {
    return button(
        {
            classes: [CHIP_REMOVE_CLASS],
            variant: BTN_VARIANT_BARE,
            ariaLabel: `Remove #${c.channelName} from ${permLabel}`,
            title: `clear all ${permLabel} overrides on #${c.channelName}`,
            context: `clear ${permLabel} for #${c.channelName}`,
            meta: ["action"],
            onClick: () => void clearChannel(ctx.getLatest(), c.channelId, bit),
        },
        [icon({ name: REMOVE_ICON_NAME, classes: [], context: null, meta: null })],
    );
}

export function channelChipEl(ctx: PermissionsCtx, c: ChannelChip, bit: number, flagName: string): Instance {
    const permLabel = formatPermissionName(flagName);
    const chip = div(
        {
            classes: [CHIP_CLASS, `${CHIP_MODIFIER_PREFIX}${c.state}`],
            title: `#${c.channelName} (${c.state}) — click to cycle: allow → deny → inherit`,
            context: null,
            meta: null,
        },
        [span(textProps([CHIP_LABEL_CLASS], `#${c.channelName}`)), channelRemoveBtn(ctx, c, bit, permLabel)],
    );
    chip.setAttr(DATA_PERM_BIT, String(bit));
    chip.setAttr(DATA_CHIP_CHANNEL, c.channelId);
    wireClick(chip.el, (e) => {
        if ((e.target as HTMLElement | null)?.closest(`.${CHIP_REMOVE_CLASS}`) !== null) return;
        void cycleChannelState(ctx.getLatest(), c.channelId, bit, c.state);
    });
    return chip;
}

export function roleLevelChips(ctx: PermissionsCtx, b: number): RoleLevelChip[] {
    const mask = 1n << BigInt(b);
    const editableRoleIds = new Set<string>();
    for (const o of ctx.latestRef.v) {
        const isEditableRole = o.kind === "role" && ((safeBigInt(o.allow) | safeBigInt(o.deny)) & mask) !== 0n;
        if (isEditableRole) editableRoleIds.add(targetIdOf(o));
    }
    return listRoles(ctx.guildId)
        .filter((r) => (safeBigInt(r.permissions) & mask) !== 0n)
        .filter((r) => !editableRoleIds.has(r.role_id))
        .map((r): RoleLevelChip => ({ roleId: r.role_id, roleName: r.name }))
        .sort((a, b2) => a.roleName.localeCompare(b2.roleName));
}

export function lockedChipEl(c: RoleLevelChip, flagName: string): Instance {
    const permLabel = formatPermissionName(flagName);
    return div(
        {
            classes: [CHIP_CLASS, LOCKED_MODIFIER],
            title: `role: ${c.roleName} has ${permLabel} via role base permissions (locked)`,
            context: null,
            meta: null,
        },
        [
            icon({ name: LOCK_ICON_NAME, classes: [], context: null, meta: null }),
            span(textProps([CHIP_LABEL_CLASS], `role: ${c.roleName}`)),
        ],
    );
}
