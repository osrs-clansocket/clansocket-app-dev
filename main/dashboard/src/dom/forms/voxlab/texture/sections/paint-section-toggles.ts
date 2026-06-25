import { createToggleInput } from "../../../../../voxlab/formatters/control-formatter.js";
import type { BrushState } from "../../../../../shared/types/voxlab/paint/paint-types.js";

export type PaintBoolKey = "paintMode" | "eyedropper" | "mirrorX" | "mirrorY" | "mirrorZ" | "hideBackFaces";

export interface PaintToggle {
    wrapper: HTMLElement;
    input: HTMLInputElement;
}

export function makeBoolToggle(
    label: string,
    key: PaintBoolKey,
    settings: BrushState,
    onChange: () => void,
): PaintToggle {
    const toggle = createToggleInput({ label, checked: settings[key] });
    toggle.input.addEventListener("change", () => {
        settings[key] = toggle.input.checked;
        onChange();
    });
    return toggle;
}

export function buildPaintToggles(settings: BrushState, onChange: () => void): Record<PaintBoolKey, PaintToggle> {
    return {
        paintMode: makeBoolToggle("Paint mode (drag to paint)", "paintMode", settings, onChange),
        eyedropper: makeBoolToggle("Eyedropper (click mesh to pick color)", "eyedropper", settings, onChange),
        mirrorX: makeBoolToggle("Mirror X", "mirrorX", settings, onChange),
        mirrorY: makeBoolToggle("Mirror Y", "mirrorY", settings, onChange),
        mirrorZ: makeBoolToggle("Mirror Z", "mirrorZ", settings, onChange),
        hideBackFaces: makeBoolToggle("Hide back faces", "hideBackFaces", settings, onChange),
    };
}
