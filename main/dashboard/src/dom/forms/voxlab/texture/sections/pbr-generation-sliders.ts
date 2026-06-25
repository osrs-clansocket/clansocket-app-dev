import { createSliderInput } from "../../../../../voxlab/formatters/control-formatter.js";
import {
    AO_RADIUS_MAX,
    AO_RADIUS_MIN,
    AO_RADIUS_STEP,
    METALNESS_THRESHOLD_MAX,
    METALNESS_THRESHOLD_MIN,
    METALNESS_THRESHOLD_STEP,
    SOBEL_STRENGTH_MAX,
    SOBEL_STRENGTH_MIN,
    SOBEL_STRENGTH_STEP,
} from "../../../../../shared/constants/voxlab/pbr-generation-constants.js";
import type { PbrGenerate } from "../../../../../shared/types/voxlab/paint/paint-types.js";
import { buildParamSlider } from "./pbr-param-slider.js";

export type { ParamSliderArgs } from "./pbr-param-slider.js";
export { buildParamSlider } from "./pbr-param-slider.js";

const FRACTION_ONE = 1;
const FRACTION_TWO = 2;

type Slider = ReturnType<typeof createSliderInput>;

interface PbrSpec {
    key: "sobel" | "threshold" | "ao";
    label: string;
    min: number;
    max: number;
    step: number;
    read: (s: PbrGenerate) => number;
    write: (s: PbrGenerate, v: number) => void;
    format: (n: number) => string;
}

const PBR_SPECS: readonly PbrSpec[] = [
    {
        key: "sobel",
        label: "Sobel strength (normal)",
        min: SOBEL_STRENGTH_MIN,
        max: SOBEL_STRENGTH_MAX,
        step: SOBEL_STRENGTH_STEP,
        read: (s) => s.sobelStrength,
        write: (s, v) => {
            s.sobelStrength = v;
        },
        format: (n) => n.toFixed(FRACTION_ONE),
    },
    {
        key: "threshold",
        label: "Metalness threshold",
        min: METALNESS_THRESHOLD_MIN,
        max: METALNESS_THRESHOLD_MAX,
        step: METALNESS_THRESHOLD_STEP,
        read: (s) => s.metalnessThreshold,
        write: (s, v) => {
            s.metalnessThreshold = v;
        },
        format: (n) => n.toFixed(FRACTION_TWO),
    },
    {
        key: "ao",
        label: "AO radius",
        min: AO_RADIUS_MIN,
        max: AO_RADIUS_MAX,
        step: AO_RADIUS_STEP,
        read: (s) => s.aoRadius,
        write: (s, v) => {
            s.aoRadius = v;
        },
        format: (n) => `${Math.round(n)}`,
    },
];

export interface PbrSliderSet {
    sobel: Slider;
    threshold: Slider;
    ao: Slider;
}

export function buildPbrSliders(settings: PbrGenerate, onChange: () => void): PbrSliderSet {
    const out: Partial<PbrSliderSet> = {};
    for (const spec of PBR_SPECS) {
        out[spec.key] = buildParamSlider({
            label: spec.label,
            min: spec.min,
            max: spec.max,
            step: spec.step,
            value: spec.read(settings),
            format: spec.format,
            apply: (v) => spec.write(settings, v),
            onChange,
        });
    }
    return out as PbrSliderSet;
}
