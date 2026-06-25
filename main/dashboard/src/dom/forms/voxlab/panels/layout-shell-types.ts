import type { LayoutSide } from "../../../../shared/types/voxlab/layout-types.js";

export type ShellAction = "up" | "down" | "swap" | "toggle-collapse";

export interface ShellActionDetail {
    id: string;
    action: ShellAction;
}

export interface LayoutShellOptions {
    id: string;
    title: string;
    side: LayoutSide;
    collapsed: boolean;
}

export const SWAP_ARROW_LEFT = "⇒";
export const SWAP_ARROW_RIGHT = "⇐";
export const COLLAPSE_GLYPH_OPEN = "▾";
export const COLLAPSE_GLYPH_CLOSED = "▸";
