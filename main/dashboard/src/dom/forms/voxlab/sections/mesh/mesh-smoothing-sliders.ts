import { createSliderInput } from "../../../../../voxlab/formatters/control-formatter.js";
import {
    CORNER_ANGLE_MAX,
    CORNER_ANGLE_MIN,
    DEFAULT_MESH_SETTINGS,
    MESH_SCALE_MAX,
    MESH_SCALE_MIN,
    SMOOTHING_ROUNDS_MAX,
    SMOOTHING_ROUNDS_MIN,
} from "../../../../../shared/constants/voxlab/mesh-settings-constants.js";
import { STEP_HUNDREDTH } from "../../../../../shared/constants/voxlab/slider-step-constants.js";

const STEP_INT = 1;
const STEP_HALF = 0.5;
const FRACTION_ONE = 1;

type Slider = ReturnType<typeof createSliderInput>;

interface MeshTrioSpec {
    key: "smoothingRounds" | "cornerAngle" | "scale";
    label: string;
    min: number;
    max: number;
    step: number;
    value: number;
    format?: (n: number) => string;
}

const MESH_TRIO_SPECS: readonly MeshTrioSpec[] = [
    {
        key: "smoothingRounds",
        label: "Side smoothing rounds",
        min: SMOOTHING_ROUNDS_MIN,
        max: SMOOTHING_ROUNDS_MAX,
        step: STEP_INT,
        value: DEFAULT_MESH_SETTINGS.smoothingRounds,
        format: (n) => `${Math.round(n)}`,
    },
    {
        key: "cornerAngle",
        label: "Corner threshold",
        min: CORNER_ANGLE_MIN,
        max: CORNER_ANGLE_MAX,
        step: STEP_HALF,
        value: DEFAULT_MESH_SETTINGS.cornerAngleDegrees,
        format: (n) => `${n.toFixed(FRACTION_ONE)}°`,
    },
    {
        key: "scale",
        label: "Scale",
        min: MESH_SCALE_MIN,
        max: MESH_SCALE_MAX,
        step: STEP_HUNDREDTH,
        value: DEFAULT_MESH_SETTINGS.scale,
    },
];

export function buildSmoothingTrio(): { smoothingRounds: Slider; cornerAngle: Slider; scale: Slider } {
    const out: Record<string, Slider> = {};
    for (const spec of MESH_TRIO_SPECS) {
        out[spec.key] = createSliderInput({
            label: spec.label,
            min: spec.min,
            max: spec.max,
            step: spec.step,
            value: spec.value,
            formatValue: spec.format,
        });
    }
    return out as { smoothingRounds: Slider; cornerAngle: Slider; scale: Slider };
}
