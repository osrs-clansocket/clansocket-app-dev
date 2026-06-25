import { BTN_VARIANT_BARE, button, div, icon, span, type Instance } from "../../../../../../factory";
import { formatPermissionName } from "../../../../../../discord/inspector/util/permission-cycle.js";
import {
    ADD_ICON_NAME,
    ARROW_ICON_NAME,
    NA_TEXT_CLASS,
    ROW_ADD_CLASS,
    ROW_ARROW_CLASS,
    ROW_BLOCK_CLASS,
    ROW_CLASS,
    ROW_NAME_CLASS,
    ROW_SLOT_CLASS,
    SLIDE_PANEL_CLASS,
    SLIDE_PANEL_OPEN_CLASS,
    type PermissionsCtx,
} from "./mode-constants.js";
import { channelChipsFor, targetChipsFor } from "./mode-chips.js";
import { isGuildOnly } from "../../../../../../../state/discord/permissions/mode-drag.js";
import { setupDropTarget } from "./mode-hover.js";
import { channelChipEl, lockedChipEl, roleLevelChips, targetChipEl } from "./mode-chip-el.js";
import { buildAddForm } from "./mode-addform.js";

interface PermSlotArgs {
    ctx: PermissionsCtx;
    bit: number;
    flagName: string;
    guildOnly: boolean;
    addBtnEl: (label: string) => Instance;
}

function buildRoleSlot(a: PermSlotArgs): Instance {
    const roleLevel = roleLevelChips(a.ctx, a.bit);
    if (a.guildOnly) {
        return div({ classes: [ROW_SLOT_CLASS], context: null, meta: null }, [
            ...roleLevel.map((c) => lockedChipEl(c, a.flagName)),
            span({ classes: [NA_TEXT_CLASS], text: "guild-level — role base perms only", context: null, meta: null }),
        ]);
    }
    const targets = targetChipsFor(a.ctx.latestRef.v, a.bit);
    return div({ classes: [ROW_SLOT_CLASS], context: null, meta: null }, [
        ...roleLevel.map((c) => lockedChipEl(c, a.flagName)),
        ...targets.map((t) => targetChipEl(a.ctx, t, a.bit, a.flagName)),
        a.addBtnEl("Add role"),
    ]);
}

function buildChannelSlot(a: PermSlotArgs): Instance {
    if (a.guildOnly)
        return div({ classes: [ROW_SLOT_CLASS], context: null, meta: null }, [
            span({ classes: [NA_TEXT_CLASS], text: "n/a", context: null, meta: null }),
        ]);
    const channels = channelChipsFor(a.ctx.guildId, a.ctx.latestRef.v, a.bit);
    return div({ classes: [ROW_SLOT_CLASS], context: null, meta: null }, [
        ...channels.map((c) => channelChipEl(a.ctx, c, a.bit, a.flagName)),
        a.addBtnEl("Add channel"),
    ]);
}

function buildRowLine(permLabel: string, roleSlot: Instance, channelSlot: Instance): Instance {
    return div({ classes: [ROW_CLASS], context: null, meta: null }, [
        span({ classes: [ROW_NAME_CLASS], text: permLabel, context: null, meta: null }),
        icon({ name: ARROW_ICON_NAME, classes: [ROW_ARROW_CLASS], context: null, meta: null }),
        roleSlot,
        icon({ name: ARROW_ICON_NAME, classes: [ROW_ARROW_CLASS], context: null, meta: null }),
        channelSlot,
    ]);
}

function makeAddBtn(permLabel: string, toggle: () => void): (ariaPrefix: string) => Instance {
    return (ariaPrefix) =>
        button(
            {
                classes: [ROW_ADD_CLASS],
                variant: BTN_VARIANT_BARE,
                ariaLabel: `${ariaPrefix} override for ${permLabel}`,
                title: `${ariaPrefix} override for ${permLabel}`,
                context: `${ariaPrefix} override for ${permLabel}`,
                meta: ["action"],
                onClick: toggle,
            },
            [icon({ name: ADD_ICON_NAME, classes: [], context: null, meta: null })],
        );
}

interface SlideToggleArgs {
    ctx: PermissionsCtx;
    bit: number;
    slidePanelEl: Instance;
    slideContent: Instance;
    openRef: { v: boolean };
}

function makeSlideToggle(a: SlideToggleArgs): { close: () => void; toggle: () => void } {
    const close = (): void => {
        a.openRef.v = false;
        a.slidePanelEl.toggleClass(SLIDE_PANEL_OPEN_CLASS, false);
        a.slideContent.clear();
    };
    const toggle = (): void => {
        if (a.openRef.v) {
            close();
            return;
        }
        a.openRef.v = true;
        a.slidePanelEl.toggleClass(SLIDE_PANEL_OPEN_CLASS, true);
        a.slideContent.setChildren(buildAddForm(a.ctx.guildId, a.bit, a.ctx.getLatest, close));
    };
    return { close, toggle };
}

export function permissionRow(ctx: PermissionsCtx, bit: number, flagName: string): Instance {
    const permLabel = formatPermissionName(flagName);
    const slideContent = div({ classes: [], context: null, meta: null });
    const slidePanelEl = div({ classes: [SLIDE_PANEL_CLASS], context: null, meta: null }, [slideContent]);
    const openRef = { v: false };
    const { toggle } = makeSlideToggle({ ctx, bit, slidePanelEl, slideContent, openRef });
    const guildOnly = isGuildOnly(bit);
    const slotArgs: PermSlotArgs = { ctx, bit, flagName, guildOnly, addBtnEl: makeAddBtn(permLabel, toggle) };
    const roleSlot = buildRoleSlot(slotArgs);
    const channelSlot = buildChannelSlot(slotArgs);
    if (!guildOnly) {
        setupDropTarget(ctx, roleSlot, "roles", bit);
        setupDropTarget(ctx, channelSlot, "channels", bit);
    }
    const rowLine = buildRowLine(permLabel, roleSlot, channelSlot);
    return div({ classes: [ROW_BLOCK_CLASS], context: null, meta: null }, [rowLine, slidePanelEl]);
}
