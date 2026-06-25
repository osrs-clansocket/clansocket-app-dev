import {
    DEFAULT_ENVIRONMENT,
    DEFAULT_HEMISPHERE,
    DEFAULT_RIM_LIGHT,
    ENV_INTENSITY_MAX,
    LIGHT_INTENSITY_MAX,
    LIGHT_POSITION_MAX,
    LIGHT_POSITION_MIN,
} from "../../../../../../shared/constants/voxlab/lighting/light-constants.js";
import type {
    EnvironmentSettings,
    HemisphereSettings,
    RimLightSettings,
} from "../../../../../../shared/types/voxlab/light-types.js";
import { SectionComponent, type SectionField } from "../../../panels/section/section-component.js";
import { STEP_HUNDREDTH, STEP_TWENTIETH } from "../../../../../../shared/constants/voxlab/slider-step-constants.js";
import { colorField, sliderField, toggleField } from "../../section-field-factories.js";

function positionSlider<T extends { positionX: number; positionY: number; positionZ: number }>(
    key: "positionX" | "positionY" | "positionZ",
    label: string,
): SectionField<T> {
    return sliderField<T>({ key, label, min: LIGHT_POSITION_MIN, max: LIGHT_POSITION_MAX, step: STEP_TWENTIETH });
}

export function createEnvironmentSection(): SectionComponent<EnvironmentSettings> {
    const fields: ReadonlyArray<SectionField<EnvironmentSettings>> = [
        toggleField("enabled", "Environment"),
        sliderField({ key: "intensity", label: "Intensity", min: 0, max: ENV_INTENSITY_MAX, step: STEP_TWENTIETH }),
    ];
    return new SectionComponent<EnvironmentSettings>({
        snapshotName: "environment",
        title: "Environment",
        eventName: "environment-change",
        defaults: { ...DEFAULT_ENVIRONMENT },
        fields,
    });
}

export function createHemisphereSection(): SectionComponent<HemisphereSettings> {
    const fields: ReadonlyArray<SectionField<HemisphereSettings>> = [
        colorField("skyColor", "Sky"),
        colorField("groundColor", "Ground"),
        sliderField({ key: "intensity", label: "Intensity", min: 0, max: LIGHT_INTENSITY_MAX, step: STEP_HUNDREDTH }),
    ];
    return new SectionComponent<HemisphereSettings>({
        snapshotName: "hemisphere",
        title: "Hemisphere",
        eventName: "hemisphere-change",
        defaults: { ...DEFAULT_HEMISPHERE },
        fields,
    });
}

const RIM_LIGHT_FIELDS: ReadonlyArray<SectionField<RimLightSettings>> = [
    sliderField({ key: "intensity", label: "Intensity", min: 0, max: LIGHT_INTENSITY_MAX, step: STEP_HUNDREDTH }),
    colorField("color", "Color"),
    positionSlider<RimLightSettings>("positionX", "Position X"),
    positionSlider<RimLightSettings>("positionY", "Position Y"),
    positionSlider<RimLightSettings>("positionZ", "Position Z"),
];

export function rimLight(): SectionComponent<RimLightSettings> {
    return new SectionComponent<RimLightSettings>({
        snapshotName: "rimLight",
        title: "Rim Light",
        eventName: "rim-light-change",
        defaults: { ...DEFAULT_RIM_LIGHT },
        fields: RIM_LIGHT_FIELDS,
    });
}

export { bottomLight, topLight } from "./split-sections-aux.js";
export { createStressSection } from "./split-sections-stress.js";
