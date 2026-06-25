import { createSliderInput, createToggleInput } from "../../../../../voxlab/formatters/control-formatter.js";
import {
    BOB_AMPLITUDE_MAX,
    DEFAULT_MOTION,
    PERIOD_MAX_MS,
    PERIOD_MIN_MS,
    PERIOD_STEP_MS,
} from "../../../../../shared/constants/voxlab/motion-constants.js";
import { STEP_TINY } from "../../../../../shared/constants/voxlab/slider-step-constants.js";

type Slider = ReturnType<typeof createSliderInput>;
type Toggle = ReturnType<typeof createToggleInput>;

export interface BobKit {
    bobEnabled: Toggle;
    bobAmplitude: Slider;
    bobPeriod: Slider;
}

export function buildBobKit(): BobKit {
    const bobEnabled = createToggleInput({ label: "Bob", checked: DEFAULT_MOTION.bobEnabled });
    const bobAmplitude = createSliderInput({
        label: "Bob amplitude",
        min: 0,
        max: BOB_AMPLITUDE_MAX,
        step: STEP_TINY,
        value: DEFAULT_MOTION.bobAmplitude,
    });
    const bobPeriod = createSliderInput({
        label: "Bob period (ms)",
        min: PERIOD_MIN_MS,
        max: PERIOD_MAX_MS,
        step: PERIOD_STEP_MS,
        value: DEFAULT_MOTION.bobPeriodMs,
        formatValue: (n) => `${Math.round(n)} ms`,
    });
    return { bobEnabled, bobAmplitude, bobPeriod };
}
