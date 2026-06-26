import { button, div, input, span, type Instance, baseProps, textProps } from "../../../../factory/index.js";
import { normalizeHex } from "../../shared/format.js";
import { CUSTOM_SWATCH_CAP, loadCustomSwatches, saveCustomSwatches } from "../../shared/swatch-storage.js";
import type { BrandingController } from "../branding-controller/index.js";
import { wireDragScroll } from "./color-picker-drag.js";
import { FORM_FIELD_LABEL } from "../../../../forms/form-classes.js";
import {
    ACCOUNT_BRANDING_COLOR_BLOCK_CLASS,
    ACCOUNT_BRANDING_COLOR_PREVIEW_CLASS,
    ACCOUNT_BRANDING_HEX_CLASS,
    ACCOUNT_BRANDING_HEX_ROW_CLASS,
    ACCOUNT_BRANDING_SWATCH_ACTIVE_CLASS,
    ACCOUNT_BRANDING_SWATCH_CLASS,
    ACCOUNT_BRANDING_SWATCH_CUSTOM_CLASS,
    ACCOUNT_BRANDING_SWATCHES_CLASS,
} from "../../../../../shared/constants/account-constants.js";

import { BRANDING_SWATCHES } from "./branding-swatches.js";

interface PickerState {
    ctrl: BrandingController;
    colorPreview: Instance;
    hexInput: Instance<HTMLInputElement>;
    swatchGrid: Instance;
    swatchEntries: { color: string; inst: Instance<HTMLButtonElement> }[];
    baseSet: Set<string>;
    customSwatchesRef: { v: string[] };
}

function applyColor(state: PickerState, next: string, fromHexInput: boolean): void {
    state.ctrl.color = next;
    state.colorPreview.el.style.background = next;
    if (!fromHexInput) state.hexInput.el.value = next;
    for (const { color, inst } of state.swatchEntries) {
        inst.toggleClass(ACCOUNT_BRANDING_SWATCH_ACTIVE_CLASS, color === next);
    }
    state.ctrl.renderAvatar();
    void state.ctrl.persist(state.ctrl.kind, state.ctrl.value);
}

function wireColorRemove(state: PickerState, sw: Instance<HTMLButtonElement>, color: string): void {
    sw.el.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        state.customSwatchesRef.v = state.customSwatchesRef.v.filter((c) => c !== color);
        saveCustomSwatches(state.customSwatchesRef.v);
        const idx = state.swatchEntries.findIndex((entry) => entry.inst.el === sw.el);
        if (idx >= 0) state.swatchEntries.splice(idx, 1);
        sw.destroy();
    });
}

function addColor(state: PickerState, color: string, custom: boolean): Instance<HTMLButtonElement> {
    const sw = button({
        classes: custom
            ? [ACCOUNT_BRANDING_SWATCH_CLASS, ACCOUNT_BRANDING_SWATCH_CUSTOM_CLASS]
            : [ACCOUNT_BRANDING_SWATCH_CLASS],
        ariaLabel: color,
        title: color,
        context: "select this color for the clan accent",
        meta: ["choice", "clan"],
        onClick: () => applyColor(state, color, false),
    });
    sw.el.style.background = color;
    if (color === state.ctrl.color) sw.toggleClass(ACCOUNT_BRANDING_SWATCH_ACTIVE_CLASS, true);
    if (custom) wireColorRemove(state, sw, color);
    state.swatchGrid.addChild(sw);
    state.swatchEntries.push({ color, inst: sw });
    return sw;
}

function buildHexInput(state: { ref: PickerState | null }): Instance<HTMLInputElement> {
    return input({
        classes: [ACCOUNT_BRANDING_HEX_CLASS],
        ariaLabel: "Color hex",
        type: "text",
        spellcheck: "false",
        autocomplete: "off",
        maxlength: "7",
        placeholder: "#rrggbb",
        context: "enter a hex color for the clan accent",
        meta: ["input", "clan"],
        onChange: () => handleHexChange(state.ref!),
    });
}

function handleHexChange(state: PickerState): void {
    const next = normalizeHex(state.hexInput.el.value);
    if (!next) {
        state.hexInput.el.value = state.ctrl.color;
        return;
    }
    if (!state.baseSet.has(next) && !state.customSwatchesRef.v.includes(next)) {
        state.customSwatchesRef.v = [...state.customSwatchesRef.v, next].slice(-CUSTOM_SWATCH_CAP);
        saveCustomSwatches(state.customSwatchesRef.v);
        const newInst = addColor(state, next, true);
        requestAnimationFrame(() => {
            newInst.el.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
        });
    }
    applyColor(state, next, true);
}

function seedColors(state: PickerState): void {
    for (const color of BRANDING_SWATCHES) addColor(state, color, false);
    for (const color of state.customSwatchesRef.v) {
        if (!state.baseSet.has(color)) addColor(state, color, true);
    }
}

export function buildColorPicker(ctrl: BrandingController): Instance {
    const colorPreview = span(baseProps([ACCOUNT_BRANDING_COLOR_PREVIEW_CLASS]));
    colorPreview.el.style.background = ctrl.color;
    const stateRef: { ref: PickerState | null } = { ref: null };
    const hexInput = buildHexInput(stateRef);
    hexInput.el.value = ctrl.color;
    const swatchGrid = div(baseProps([ACCOUNT_BRANDING_SWATCHES_CLASS]));
    const state: PickerState = {
        ctrl,
        colorPreview,
        hexInput,
        swatchGrid,
        swatchEntries: [],
        baseSet: new Set(BRANDING_SWATCHES.map((c) => c.toLowerCase())),
        customSwatchesRef: { v: loadCustomSwatches() },
    };
    stateRef.ref = state;
    seedColors(state);
    wireDragScroll(swatchGrid);
    return div(baseProps([ACCOUNT_BRANDING_COLOR_BLOCK_CLASS]), [
        span(textProps([FORM_FIELD_LABEL], "Color")),
        swatchGrid,
        div(baseProps([ACCOUNT_BRANDING_HEX_ROW_CLASS]), [colorPreview, hexInput]),
    ]);
}
