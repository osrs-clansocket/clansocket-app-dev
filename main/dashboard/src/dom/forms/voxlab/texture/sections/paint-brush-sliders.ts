import { createSliderInput } from "../../../../../voxlab/formatters/control-formatter.js";
import {
    BRUSH_OPACITY_MAX,
    BRUSH_OPACITY_MIN,
    BRUSH_OPACITY_STEP,
    BRUSH_RADIUS_MAX,
    BRUSH_RADIUS_MIN,
    BRUSH_RADIUS_STEP,
    FALLOFF_SIGMA_MAX,
    FALLOFF_SIGMA_MIN,
    FALLOFF_SIGMA_STEP,
} from "../../../../../shared/constants/voxlab/texture-paint-constants.js";
import type { BrushState } from "../../../../../shared/types/voxlab/paint/paint-types.js";

const FRACTION_DIGITS = 2;

type Slider = ReturnType<typeof createSliderInput>;

interface BrushSpec {
    key: "radius" | "falloff" | "opacity";
    label: string;
    min: number;
    max: number;
    step: number;
    read: (s: BrushState) => number;
    write: (s: BrushState, v: number) => void;
}

const BRUSH_SPECS: readonly BrushSpec[] = [
    {
        key: "radius",
        label: "Brush radius",
        min: BRUSH_RADIUS_MIN,
        max: BRUSH_RADIUS_MAX,
        step: BRUSH_RADIUS_STEP,
        read: (s) => s.radius,
        write: (s, v) => {
            s.radius = v;
        },
    },
    {
        key: "falloff",
        label: "Falloff",
        min: FALLOFF_SIGMA_MIN,
        max: FALLOFF_SIGMA_MAX,
        step: FALLOFF_SIGMA_STEP,
        read: (s) => s.falloffSigma,
        write: (s, v) => {
            s.falloffSigma = v;
        },
    },
    {
        key: "opacity",
        label: "Opacity",
        min: BRUSH_OPACITY_MIN,
        max: BRUSH_OPACITY_MAX,
        step: BRUSH_OPACITY_STEP,
        read: (s) => s.opacity,
        write: (s, v) => {
            s.opacity = v;
        },
    },
];

function wireSlider(slider: Slider, apply: (n: number) => void, onChange: () => void): Slider {
    slider.input.addEventListener("input", () => {
        apply(Number.parseFloat(slider.input.value));
        onChange();
    });
    return slider;
}

export function buildBrushControl(
    settings: BrushState,
    onChange: () => void,
): { radius: Slider; falloff: Slider; opacity: Slider } {
    const fmt = (n: number): string => n.toFixed(FRACTION_DIGITS);
    const out: Record<string, Slider> = {};
    for (const spec of BRUSH_SPECS) {
        const slider = createSliderInput({
            label: spec.label,
            min: spec.min,
            max: spec.max,
            step: spec.step,
            value: spec.read(settings),
            formatValue: fmt,
        });
        out[spec.key] = wireSlider(slider, (v) => spec.write(settings, v), onChange);
    }
    return out as { radius: Slider; falloff: Slider; opacity: Slider };
}
