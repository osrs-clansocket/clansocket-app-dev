import type { BrandingController } from "../../branding-controller/index.js";
import {
    ROTATE_MAX,
    ROTATE_MIN,
    ROTATE_STEP,
    SCALE_MAX,
    SCALE_MIN,
    SCALE_STEP,
    TRANSLATE_MAX,
    TRANSLATE_STEP,
} from "./constants.js";

export interface SliderSpec {
    min: number;
    max: number;
    step: number;
    value: number;
    ariaLabel: string;
    context: string;
    apply: (v: number) => void;
}

type SpecKey = "scale" | "rotate" | "translateX" | "translateY";

export const SPEC_FACTORIES: Record<SpecKey, (ctrl: BrandingController) => SliderSpec> = {
    scale: (c) => ({
        min: SCALE_MIN,
        max: SCALE_MAX,
        step: SCALE_STEP,
        value: c.transform.scale,
        ariaLabel: "Scale",
        context: "adjust the avatar scale",
        apply: (scale) => c.setTransform({ scale }),
    }),
    rotate: (c) => ({
        min: ROTATE_MIN,
        max: ROTATE_MAX,
        step: ROTATE_STEP,
        value: c.transform.rotate,
        ariaLabel: "Rotate",
        context: "adjust the avatar rotation",
        apply: (rotate) => c.setTransform({ rotate }),
    }),
    translateX: (c) => ({
        min: -TRANSLATE_MAX,
        max: TRANSLATE_MAX,
        step: TRANSLATE_STEP,
        value: c.transform.translateX,
        ariaLabel: "Position X",
        context: "adjust the avatar horizontal position",
        apply: (translateX) => c.setTransform({ translateX }),
    }),
    translateY: (c) => ({
        min: -TRANSLATE_MAX,
        max: TRANSLATE_MAX,
        step: TRANSLATE_STEP,
        value: c.transform.translateY,
        ariaLabel: "Position Y",
        context: "adjust the avatar vertical position",
        apply: (translateY) => c.setTransform({ translateY }),
    }),
};
