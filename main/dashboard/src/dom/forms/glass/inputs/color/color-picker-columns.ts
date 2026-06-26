import { div, input, type Instance, baseProps } from "../../../../factory/index.js";
import { sliderRow } from "./sliders.js";
import type { PickerSliders } from "./color-picker-types.js";

const PICKER_COLUMN = "picker__popup-column";
const PICKER_COLUMN_TITLE = "picker__popup-column-title";
const PICKER_HEX_INPUT = "picker__popup-hex-input";

export function buildPickerColumns(sliders: PickerSliders): { hslCol: Instance; rgbCol: Instance } {
    const hslCol = div(baseProps([PICKER_COLUMN]), [
        div(baseProps([PICKER_COLUMN_TITLE]), ["HSL"]),
        sliderRow("H", sliders.hue),
        sliderRow("S", sliders.sat),
        sliderRow("L", sliders.lit),
    ]);
    const rgbCol = div(baseProps([PICKER_COLUMN]), [
        div(baseProps([PICKER_COLUMN_TITLE]), ["RGB"]),
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
