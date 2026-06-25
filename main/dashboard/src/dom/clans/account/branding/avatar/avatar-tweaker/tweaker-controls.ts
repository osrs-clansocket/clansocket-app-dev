import { div, span, type Instance } from "../../../../../factory/index.js";
import type { createSliderSpecs } from "./sliders.js";
import {
    TWEAKER_CONTROLS_CLASS,
    TWEAKER_ROW_CLASS,
    TWEAKER_SLIDER_LABEL_CLASS,
} from "../../../../../../shared/constants/branding-tweaker-constants.js";

export function buildTweakerControls(sliders: ReturnType<typeof createSliderSpecs>, statusEl: Instance): Instance {
    const sliderRow = (label: string, slider: Instance): Instance =>
        div({ classes: [TWEAKER_ROW_CLASS], context: null, meta: null }, [
            span({ classes: [TWEAKER_SLIDER_LABEL_CLASS], text: label, context: null, meta: null }),
            slider,
        ]);
    return div({ classes: [TWEAKER_CONTROLS_CLASS], context: null, meta: null }, [
        sliderRow("Scale", sliders.scale),
        sliderRow("Rotate", sliders.rotate),
        sliderRow("Pos X", sliders.translateX),
        sliderRow("Pos Y", sliders.translateY),
        statusEl,
    ]);
}
