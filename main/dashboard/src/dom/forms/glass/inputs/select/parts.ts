export const CLASS_ROOT = "glass-select";
export const CLASS_TRIGGER = "glass-select__trigger";
export const CLASS_LABEL = "glass-select__label";
export const CLASS_PANEL = "glass-select__panel";
export const CLASS_PANEL_INNER = "glass-select__panel-inner";
export const CLASS_GRID = "glass-select__grid";

export type { SelectOption } from "./option.js";
export { buildOption } from "./option.js";
export { applyFilter, buildSearchInput } from "./filter.js";
export { wireSelectClicks } from "./commit.js";
export { buildSelectTrigger } from "./trigger.js";
export { buildHiddenInput } from "./hidden.js";
