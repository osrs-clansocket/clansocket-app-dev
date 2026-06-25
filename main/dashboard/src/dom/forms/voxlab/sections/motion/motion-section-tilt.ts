import { createSliderInput, createToggleInput } from "../../../../../voxlab/formatters/control-formatter.js";
import { DEFAULT_MOTION, TILT_STRENGTH_MAX } from "../../../../../shared/constants/voxlab/motion-constants.js";
import { STEP_HUNDREDTH } from "../../../../../shared/constants/voxlab/slider-step-constants.js";

type Slider = ReturnType<typeof createSliderInput>;
type Toggle = ReturnType<typeof createToggleInput>;

export interface TiltKit {
    tiltEnabled: Toggle;
    tiltStrength: Slider;
}

export function buildTiltKit(): TiltKit {
    const tiltEnabled = createToggleInput({ label: "Tilt (cursor follow)", checked: DEFAULT_MOTION.tiltEnabled });
    const tiltStrength = createSliderInput({
        label: "Tilt strength",
        min: 0,
        max: TILT_STRENGTH_MAX,
        step: STEP_HUNDREDTH,
        value: DEFAULT_MOTION.tiltStrength,
    });
    return { tiltEnabled, tiltStrength };
}
