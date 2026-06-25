import { createColorInput } from "../../../../../voxlab/formatters/control-formatter.js";
import { DropdownComponent, type DropdownChangeDetail } from "../../panels/dropdown-component.js";
import type { BrushMode, BrushState } from "../../../../../shared/types/voxlab/paint/paint-types.js";

export { buildBrushControl } from "./paint-brush-sliders.js";

export function buildColorPicker(settings: BrushState, onChange: () => void): ReturnType<typeof createColorInput> {
    const colorPicker = createColorInput({ label: "Color", value: settings.color });
    colorPicker.input.addEventListener("input", () => {
        settings.color = colorPicker.input.value;
        onChange();
    });
    return colorPicker;
}

export function buildModeControl(settings: BrushState, onChange: () => void): DropdownComponent<BrushMode> {
    const dd = new DropdownComponent<BrushMode>(
        [
            { value: "paint", label: "Paint" },
            { value: "erase", label: "Erase" },
        ],
        settings.mode,
    );
    dd.addEventListener("change", (e) => {
        const detail = (e as CustomEvent<DropdownChangeDetail<BrushMode>>).detail;
        settings.mode = detail.value;
        onChange();
    });
    return dd;
}
