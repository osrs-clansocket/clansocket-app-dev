import type { DiscordChannelOverwrite } from "../../../../../../../state/discord/client.js";
import type { Instance } from "../../../../../../factory";
import type { createWireOverlay } from "./mode-overlay.js";

export const HOST_CLASS = "clans-manage__permission-rows";
export const HOVERED_CLASS = "clans-manage__permission-rows--hovered";
export const RELATED_CLASS = "is-related";
export const DROP_TARGET_CLASS = "is-drop-target";
export const ROW_BLOCK_CLASS = "clans-manage__permission-row-block";
export const ROW_CLASS = "clans-manage__permission-row";
export const ROW_NAME_CLASS = "clans-manage__permission-row-name";
export const ROW_ARROW_CLASS = "clans-manage__permission-row-arrow";
export const ROW_SLOT_CLASS = "clans-manage__permission-row-slot";
export const ROW_ADD_CLASS = "clans-manage__permission-row-add";
export const SLIDE_PANEL_CLASS = "slide-panel__panel";
export const SLIDE_PANEL_OPEN_CLASS = "slide-panel__panel--open";
export const ADD_FORM_CLASS = "clans-manage__permission-add-form";
export const ADD_FORM_ACTIONS_CLASS = "clans-manage__permission-add-form-actions";
export const ADD_FORM_BTN_CLASS = "clans-manage__discord-toolbar-btn";
export const CHIP_CLASS = "clans-manage__permission-chip";
export const SWATCH_LABEL_CLASS = "clans-manage__permission-swatch-label";
export const ACCORDION_LABEL_CLASS = "clans-manage__permission-accordion-label";
export const CHIP_MODIFIER_PREFIX = "clans-manage__permission-chip--";
export const CHIP_LABEL_CLASS = "clans-manage__permission-chip-label";
export const CHIP_REMOVE_CLASS = "clans-manage__permission-chip-remove";
export const ACCORDION_CLASS = "clans-manage__permission-accordion";
export const ACCORDION_HEADER_CLASS = "clans-manage__permission-accordion-header";
export const ACCORDION_CHEVRON_CLASS = "clans-manage__permission-accordion-chevron";
export const ACCORDION_BODY_CLASS = "clans-manage__permission-accordion-body";
export const ACCORDION_OPEN_CLASS = "is-open";
export const SWATCH_CLASS = "clans-manage__permission-swatch";
export const ARROW_ICON_NAME = "arrow-right-short";
export const CHEVRON_ICON_NAME = "chevron-right";
export const ADD_ICON_NAME = "plus-lg";
export const REMOVE_ICON_NAME = "x-lg";
export const LOCK_ICON_NAME = "lock";
export const LOCKED_MODIFIER = "is-locked";
export const NA_TEXT_CLASS = "clans-manage__permission-na-text";
export const OVERLAY_CLASS = "clans-manage__permission-wires";
export const ROWS_LIST_CLASS = "clans-manage__permission-rows-list";
export const WIRE_CLASS = "clans-manage__permission-wire";

export const HIDDEN_INPUT_SELECTOR = "input[type='hidden']";
export const DATA_PERM_BIT = "data-perm-bit";
export const DATA_CHIP_TARGET = "data-chip-target";
export const DATA_CHIP_CHANNEL = "data-chip-channel";
export const CHIP_DATA_SELECTOR = "[data-chip-target], [data-chip-channel]";
export const EVERYONE_NAME = "@everyone";

export type ChipState = "allow" | "deny" | "mixed";
export type Branch = "allow" | "deny";
export type DragKind = "channel" | "role" | "member";

export interface RoleLevelChip {
    roleId: string;
    roleName: string;
}
export interface TargetChip {
    kind: "role" | "member";
    targetId: string;
    targetName: string;
    state: ChipState;
}
export interface ChannelChip {
    channelId: string;
    channelName: string;
    state: ChipState;
}

export interface PermissionsCtx {
    guildId: string;
    rowsHost: Instance;
    rowsList: Instance;
    overlay: ReturnType<typeof createWireOverlay>;
    latestRef: { v: readonly DiscordChannelOverwrite[] };
    getLatest: () => readonly DiscordChannelOverwrite[];
    clearHover: () => void;
}
