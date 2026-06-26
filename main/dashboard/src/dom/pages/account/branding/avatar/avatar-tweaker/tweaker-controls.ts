import { div, span, type Instance, baseProps, textProps } from "../../../../../factory/index.js";
import type { createSliderSpecs } from "./sliders.js";
import {
    TWEAKER_CONTROLS_CLASS,
    TWEAKER_ROW_CLASS,
    TWEAKER_SLIDER_LABEL_CLASS,
} from "../../../../../../shared/constants/branding-tweaker-constants.js";

export function buildTweakerControls(sliders: ReturnType<typeof createSliderSpecs>, statusEl: Instance): Instance {
    const sliderRow = (label: string, slider: Instance): Instance =>
        div(baseProps([TWEAKER_ROW_CLASS]), [span(textProps([TWEAKER_SLIDER_LABEL_CLASS], label)), slider]);
    return div(baseProps([TWEAKER_CONTROLS_CLASS]), [
        sliderRow("Scale", sliders.scale),
        sliderRow("Rotate", sliders.rotate),
        sliderRow("Pos X", sliders.translateX),
        sliderRow("Pos Y", sliders.translateY),
        statusEl,
    ]);
}
