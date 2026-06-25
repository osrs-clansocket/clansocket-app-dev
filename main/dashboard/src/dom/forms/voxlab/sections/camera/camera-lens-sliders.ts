import { createSliderInput } from "../../../../../voxlab/formatters/control-formatter.js";
import {
    CAMERA_FAR_MAX,
    CAMERA_FAR_MIN,
    CAMERA_FOV_MAX,
    CAMERA_FOV_MIN,
    CAMERA_NEAR_MAX,
    CAMERA_NEAR_MIN,
    DEFAULT_CAMERA,
} from "../../../../../shared/constants/voxlab/camera-constants.js";

const STEP_HALF = 0.5;
const STEP_NEAR = 0.001;
const STEP_INT = 1;
const FRACTION_THREE = 3;

type Slider = ReturnType<typeof createSliderInput>;

interface LensSpec {
    key: "fov" | "near" | "far";
    label: string;
    min: number;
    max: number;
    step: number;
    value: number;
    format: (n: number) => string;
}

const LENS_SPECS: readonly LensSpec[] = [
    {
        key: "fov",
        label: "FOV",
        min: CAMERA_FOV_MIN,
        max: CAMERA_FOV_MAX,
        step: STEP_HALF,
        value: DEFAULT_CAMERA.fov,
        format: (n) => `${Math.round(n)}°`,
    },
    {
        key: "near",
        label: "Near clip",
        min: CAMERA_NEAR_MIN,
        max: CAMERA_NEAR_MAX,
        step: STEP_NEAR,
        value: DEFAULT_CAMERA.near,
        format: (n) => n.toFixed(FRACTION_THREE),
    },
    {
        key: "far",
        label: "Far clip",
        min: CAMERA_FAR_MIN,
        max: CAMERA_FAR_MAX,
        step: STEP_INT,
        value: DEFAULT_CAMERA.far,
        format: (n) => `${Math.round(n)}`,
    },
];

export function buildLensSliders(): { fov: Slider; near: Slider; far: Slider } {
    const out: Record<string, Slider> = {};
    for (const spec of LENS_SPECS) {
        out[spec.key] = createSliderInput({
            label: spec.label,
            min: spec.min,
            max: spec.max,
            step: spec.step,
            value: spec.value,
            formatValue: spec.format,
        });
    }
    return out as { fov: Slider; near: Slider; far: Slider };
}
