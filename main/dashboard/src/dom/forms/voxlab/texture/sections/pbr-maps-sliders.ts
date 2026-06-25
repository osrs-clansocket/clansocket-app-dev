import { createSliderInput } from "../../../../../voxlab/formatters/control-formatter.js";
import {
    PBR_INTENSITY_MAX,
    PBR_INTENSITY_MIN,
    PBR_INTENSITY_STEP,
    PBR_NORMAL_SCALE_MAX,
    PBR_NORMAL_SCALE_MIN,
    PBR_NORMAL_SCALE_STEP,
} from "../../../../../shared/constants/voxlab/texture-paint-constants.js";
import type { PbrMapsChange, PbrMapsSettings } from "../../../../../shared/types/voxlab/paint/paint-types.js";
import type { IntensityKey } from "./pbr-maps-types.js";

export { INTENSITY_TO_SLOT, SLOT_LABELS, SLOT_HUMAN_LABELS } from "./pbr-maps-types.js";
export type { IntensityKey } from "./pbr-maps-types.js";

const FRACTION_TWO = 2;

interface SliderRowArgs {
    key: IntensityKey;
    label: string;
    min: number;
    max: number;
    step: number;
}

function buildIntensitySlider(
    args: SliderRowArgs,
    settings: PbrMapsSettings,
    emit: (next: PbrMapsChange) => void,
    intensityInputs: Partial<Record<IntensityKey, HTMLInputElement>>,
): HTMLElement {
    const { key, label, min, max, step } = args;
    const slider = createSliderInput({
        label,
        min,
        max,
        step,
        value: settings[key],
        formatValue: (n) => n.toFixed(FRACTION_TWO),
    });
    slider.input.addEventListener("input", () => {
        settings[key] = Number.parseFloat(slider.input.value);
        emit({ ...settings });
    });
    intensityInputs[key] = slider.input;
    return slider.wrapper;
}

function buildNormalSlider(
    settings: PbrMapsSettings,
    emit: (next: PbrMapsChange) => void,
    intensityInputs: Partial<Record<IntensityKey, HTMLInputElement>>,
): HTMLElement {
    return buildIntensitySlider(
        {
            key: "normalScale",
            label: "Normal scale",
            min: PBR_NORMAL_SCALE_MIN,
            max: PBR_NORMAL_SCALE_MAX,
            step: PBR_NORMAL_SCALE_STEP,
        },
        settings,
        emit,
        intensityInputs,
    );
}

export function buildIntensitySliders(
    settings: PbrMapsSettings,
    emit: (next: PbrMapsChange) => void,
    intensityInputs: Partial<Record<IntensityKey, HTMLInputElement>>,
): HTMLElement[] {
    const i = (key: IntensityKey, label: string): HTMLElement =>
        buildIntensitySlider(
            { key, label, min: PBR_INTENSITY_MIN, max: PBR_INTENSITY_MAX, step: PBR_INTENSITY_STEP },
            settings,
            emit,
            intensityInputs,
        );
    return [
        buildNormalSlider(settings, emit, intensityInputs),
        i("roughnessIntensity", "Roughness intensity"),
        i("metalnessIntensity", "Metalness intensity"),
        i("aoIntensity", "AO intensity"),
    ];
}
