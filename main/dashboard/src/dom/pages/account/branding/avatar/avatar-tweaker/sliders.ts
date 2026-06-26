import { input, type Instance } from "../../../../../factory/index.js";
import type { IconTransform } from "../../../../../../state/clans/clans-client/index.js";
import type { BrandingController } from "../../branding-controller/index.js";
import { clamp } from "./constants.js";
import { SLIDER_CLASS } from "../../../../../../shared/constants/input-constants.js";
import { TWEAKER_SLIDER_CLASS } from "../../../../../../shared/constants/branding-tweaker-constants.js";
import { SPEC_FACTORIES, type SliderSpec } from "./slider-factories.js";

export interface SliderSpecBundle {
    scale: Instance<HTMLInputElement>;
    rotate: Instance<HTMLInputElement>;
    translateX: Instance<HTMLInputElement>;
    translateY: Instance<HTMLInputElement>;
    syncToTransform: (t: IconTransform) => void;
}

function buildSlider(spec: SliderSpec, render: () => void): Instance<HTMLInputElement> {
    const sliderInput = input({
        classes: [SLIDER_CLASS, TWEAKER_SLIDER_CLASS],
        type: "range",
        min: String(spec.min),
        max: String(spec.max),
        step: String(spec.step),
        value: String(spec.value),
        ariaLabel: spec.ariaLabel,
        context: spec.context,
        meta: ["input", "clan"],
        onInput: () => {
            const v = clamp(Number(sliderInput.el.value), spec.min, spec.max);
            spec.apply(v);
            render();
        },
    });
    return sliderInput;
}

export function createSliderSpecs(ctrl: BrandingController, render: () => void): SliderSpecBundle {
    return makeSliderBundle({
        scaleInput: buildSlider(SPEC_FACTORIES.scale(ctrl), render),
        rotateInput: buildSlider(SPEC_FACTORIES.rotate(ctrl), render),
        translateXInput: buildSlider(SPEC_FACTORIES.translateX(ctrl), render),
        translateYInput: buildSlider(SPEC_FACTORIES.translateY(ctrl), render),
    });
}

function makeSliderBundle(args: {
    scaleInput: Instance<HTMLInputElement>;
    rotateInput: Instance<HTMLInputElement>;
    translateXInput: Instance<HTMLInputElement>;
    translateYInput: Instance<HTMLInputElement>;
}): SliderSpecBundle {
    const { scaleInput, rotateInput, translateXInput, translateYInput } = args;
    return {
        scale: scaleInput,
        rotate: rotateInput,
        translateX: translateXInput,
        translateY: translateYInput,
        syncToTransform: (t) => {
            if (scaleInput.el.value !== String(t.scale)) scaleInput.el.value = String(t.scale);
            if (rotateInput.el.value !== String(t.rotate)) rotateInput.el.value = String(t.rotate);
            if (translateXInput.el.value !== String(t.translateX)) translateXInput.el.value = String(t.translateX);
            if (translateYInput.el.value !== String(t.translateY)) translateYInput.el.value = String(t.translateY);
        },
    };
}
