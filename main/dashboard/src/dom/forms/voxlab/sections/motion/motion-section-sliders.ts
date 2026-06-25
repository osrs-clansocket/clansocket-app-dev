import { createSliderInput, createToggleInput } from "../../../../../voxlab/formatters/control-formatter.js";
import {
    BREATHE_AMPLITUDE_MAX,
    DEFAULT_MOTION,
    PERIOD_MAX_MS,
    PERIOD_MIN_MS,
    PERIOD_STEP_MS,
} from "../../../../../shared/constants/voxlab/motion-constants.js";
import { STEP_TINY } from "../../../../../shared/constants/voxlab/slider-step-constants.js";

export { buildBobKit, type BobKit } from "./motion-section-bob.js";
export { buildTiltKit, type TiltKit } from "./motion-section-tilt.js";

type Slider = ReturnType<typeof createSliderInput>;
type Toggle = ReturnType<typeof createToggleInput>;

export interface BreatheKit {
    breatheEnabled: Toggle;
    breatheAmplitude: Slider;
    breathePeriod: Slider;
}

export function buildBreatheKit(): BreatheKit {
    const breatheEnabled = createToggleInput({ label: "Breathe", checked: DEFAULT_MOTION.breatheEnabled });
    const breatheAmplitude = createSliderInput({
        label: "Breathe amplitude",
        min: 0,
        max: BREATHE_AMPLITUDE_MAX,
        step: STEP_TINY,
        value: DEFAULT_MOTION.breatheAmplitude,
    });
    const breathePeriod = createSliderInput({
        label: "Breathe period (ms)",
        min: PERIOD_MIN_MS,
        max: PERIOD_MAX_MS,
        step: PERIOD_STEP_MS,
        value: DEFAULT_MOTION.breathePeriodMs,
        formatValue: (n) => `${Math.round(n)} ms`,
    });
    return { breatheEnabled, breatheAmplitude, breathePeriod };
}
