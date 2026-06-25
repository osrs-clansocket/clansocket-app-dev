import {
    DEFAULT_LIGHTING,
    LIGHT_INTENSITY_MAX,
    LIGHT_POSITION_MAX,
    LIGHT_POSITION_MIN,
    SHADOW_BIAS_MAX,
    SHADOW_BIAS_MIN,
    SHADOW_RADIUS_MAX,
    SHADOW_RADIUS_MIN,
} from "../../../../../../shared/constants/voxlab/lighting/light-constants.js";
import { SectionComponent, type SectionField } from "../../../panels/section/section-component.js";
import { STEP_HUNDREDTH, STEP_TWENTIETH } from "../../../../../../shared/constants/voxlab/slider-step-constants.js";
import { pick, type AmbientFields, type KeyLightFields } from "./split-sections-types.js";
import { sliderField } from "../../section-field-factories.js";

function keyPositionSlider(
    key: "keyPositionX" | "keyPositionY" | "keyPositionZ",
    label: string,
): SectionField<KeyLightFields> {
    return sliderField<KeyLightFields>({
        key,
        label,
        min: LIGHT_POSITION_MIN,
        max: LIGHT_POSITION_MAX,
        step: STEP_TWENTIETH,
    });
}

export function createAmbientSection(): SectionComponent<AmbientFields> {
    const fields: ReadonlyArray<SectionField<AmbientFields>> = [
        sliderField({
            key: "ambientIntensity",
            label: "Intensity",
            min: 0,
            max: LIGHT_INTENSITY_MAX,
            step: STEP_HUNDREDTH,
        }),
    ];
    return new SectionComponent<AmbientFields>({
        snapshotName: "ambient",
        title: "Ambient",
        eventName: "ambient-change",
        defaults: pick(DEFAULT_LIGHTING, ["ambientIntensity"]),
        fields,
    });
}

const KEY_LIGHT_FIELDS: ReadonlyArray<SectionField<KeyLightFields>> = [
    sliderField({ key: "keyIntensity", label: "Intensity", min: 0, max: LIGHT_INTENSITY_MAX, step: STEP_HUNDREDTH }),
    keyPositionSlider("keyPositionX", "Position X"),
    keyPositionSlider("keyPositionY", "Position Y"),
    keyPositionSlider("keyPositionZ", "Position Z"),
    sliderField({
        key: "shadowBias",
        label: "Shadow bias",
        min: SHADOW_BIAS_MIN,
        max: SHADOW_BIAS_MAX,
        step: 0.0001,
        formatValue: (n) => n.toFixed(4),
    }),
    sliderField({
        key: "shadowRadius",
        label: "Shadow softness",
        min: SHADOW_RADIUS_MIN,
        max: SHADOW_RADIUS_MAX,
        step: 0.1,
    }),
];

export function keyLight(): SectionComponent<KeyLightFields> {
    return new SectionComponent<KeyLightFields>({
        snapshotName: "keyLight",
        title: "Key Light",
        eventName: "key-light-change",
        defaults: pick(DEFAULT_LIGHTING, [
            "keyIntensity",
            "keyPositionX",
            "keyPositionY",
            "keyPositionZ",
            "shadowBias",
            "shadowRadius",
        ]),
        fields: KEY_LIGHT_FIELDS,
    });
}

export { fillLight } from "./split-sections-fill.js";
