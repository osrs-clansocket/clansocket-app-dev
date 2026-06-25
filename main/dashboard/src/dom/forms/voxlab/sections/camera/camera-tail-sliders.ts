import { createSliderInput } from "../../../../../voxlab/formatters/control-formatter.js";
import {
    CAMERA_DAMPING_MAX,
    CAMERA_DAMPING_MIN,
    CAMERA_FIT_MULTIPLIER_MAX,
    CAMERA_FIT_MULTIPLIER_MIN,
    DEFAULT_CAMERA,
} from "../../../../../shared/constants/voxlab/camera-constants.js";
import { STEP_HUNDREDTH, STEP_TWENTIETH } from "../../../../../shared/constants/voxlab/slider-step-constants.js";

type Slider = ReturnType<typeof createSliderInput>;

export function buildTailSliders(): { damping: Slider; fitMul: Slider; frontMul: Slider } {
    return {
        damping: createSliderInput({
            label: "Orbit damping",
            min: CAMERA_DAMPING_MIN,
            max: CAMERA_DAMPING_MAX,
            step: STEP_HUNDREDTH,
            value: DEFAULT_CAMERA.dampingFactor,
        }),
        fitMul: createSliderInput({
            label: "Fit distance multiplier",
            min: CAMERA_FIT_MULTIPLIER_MIN,
            max: CAMERA_FIT_MULTIPLIER_MAX,
            step: STEP_TWENTIETH,
            value: DEFAULT_CAMERA.fitDistanceMultiplier,
        }),
        frontMul: createSliderInput({
            label: "Front-view multiplier",
            min: CAMERA_FIT_MULTIPLIER_MIN,
            max: CAMERA_FIT_MULTIPLIER_MAX,
            step: STEP_TWENTIETH,
            value: DEFAULT_CAMERA.frontDistanceMultiplier,
        }),
    };
}
