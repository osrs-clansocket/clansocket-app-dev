import { div, input, type Instance } from "../../../../factory/index.js";
import { sliderRow } from "./sliders.js";
import type { PickerSliders } from "./color-picker-types.js";

const PICKER_COLUMN = "voxlab__picker-popup-column";
const PICKER_COLUMN_TITLE = "voxlab__picker-popup-column-title";
const PICKER_HEX_INPUT = "voxlab__picker-popup-hex-input";

export function buildPickerColumns(sliders: PickerSliders): { hslCol: Instance; rgbCol: Instance } {
    const hslCol = div({ classes: [PICKER_COLUMN], context: null, meta: null }, [
        div({ classes: [PICKER_COLUMN_TITLE], context: null, meta: null }, ["HSL"]),
        sliderRow("H", sliders.hue),
        sliderRow("S", sliders.sat),
        sliderRow("L", sliders.lit),
    ]);
    const rgbCol = div({ classes: [PICKER_COLUMN], context: null, meta: null }, [
        div({ classes: [PICKER_COLUMN_TITLE], context: null, meta: null }, ["RGB"]),
        sliderRow("R", sliders.red),
        sliderRow("G", sliders.grn),
        sliderRow("B", sliders.blu),
    ]);
    return { hslCol, rgbCol };
}

export function buildHexInput(initial: string): Instance<HTMLInputElement> {
    return input({
        type: "text",
        classes: [PICKER_HEX_INPUT],
        value: initial,
        ariaLabel: "color hex value",
        context: "edit color as hex",
        meta: ["input"],
    });
}
