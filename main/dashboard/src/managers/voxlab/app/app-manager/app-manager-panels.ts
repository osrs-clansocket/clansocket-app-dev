import type { MountAllDeps as _MountAllDeps, PanelDeps as _PanelDeps } from "../panel-mount/panel-deps.js";
export type MountAllDeps = _MountAllDeps;
export type PanelDeps = _PanelDeps;
import { mountPresetsPanel as _mountPresetsPanel } from "../panel-mount/panel-mount-presets.js";
export const mountPresetsPanel = _mountPresetsPanel;
import { buildLightPanel as _buildLightPanel } from "../panel-mount/panel-mount-light.js";
export const buildLightPanel = _buildLightPanel;
import { mountAnimationsPanel as _mountAnimationsPanel } from "../panel-mount/panel-mount-animations.js";
export const mountAnimationsPanel = _mountAnimationsPanel;
import { mountFooterSections as _mountFooterSections } from "../panel-mount/mount-footer-sections.js";
export const mountFooterSections = _mountFooterSections;
import {
    mountActionsPanel as _mountActionsPanel,
    mountAllPanels as _mountAllPanels,
} from "../panel-mount/panel-mount-actions.js";
export const mountActionsPanel = _mountActionsPanel;
export const mountAllPanels = _mountAllPanels;
