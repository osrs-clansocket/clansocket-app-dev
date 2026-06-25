import {
    DEFAULT_LIGHTING,
    LIGHT_INTENSITY_MAX,
    LIGHT_POSITION_MAX,
    LIGHT_POSITION_MIN,
} from "../../../../../../shared/constants/voxlab/lighting/light-constants.js";
import { SectionComponent, type SectionField } from "../../../panels/section/section-component.js";
import { STEP_HUNDREDTH, STEP_TWENTIETH } from "../../../../../../shared/constants/voxlab/slider-step-constants.js";
import { pick, type FillLightFields } from "./split-sections-types.js";
import { colorField, sliderField } from "../../section-field-factories.js";

function fillPositionSlider(
    key: "fillPositionX" | "fillPositionY" | "fillPositionZ",
    label: string,
): SectionField<FillLightFields> {
    return sliderField<FillLightFields>({
        key,
        label,
        min: LIGHT_POSITION_MIN,
        max: LIGHT_POSITION_MAX,
        step: STEP_TWENTIETH,
    });
}

const FILL_LIGHT_FIELDS: ReadonlyArray<SectionField<FillLightFields>> = [
    sliderField({ key: "fillIntensity", label: "Intensity", min: 0, max: LIGHT_INTENSITY_MAX, step: STEP_HUNDREDTH }),
    colorField("fillColor", "Color"),
    fillPositionSlider("fillPositionX", "Position X"),
    fillPositionSlider("fillPositionY", "Position Y"),
    fillPositionSlider("fillPositionZ", "Position Z"),
];

export function fillLight(): SectionComponent<FillLightFields> {
    return new SectionComponent<FillLightFields>({
        snapshotName: "fillLight",
        title: "Fill Light",
        eventName: "fill-light-change",
        defaults: pick(DEFAULT_LIGHTING, [
            "fillIntensity",
            "fillColor",
            "fillPositionX",
            "fillPositionY",
            "fillPositionZ",
        ]),
        fields: FILL_LIGHT_FIELDS,
    });
}
