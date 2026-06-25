import { DEFAULT_MATERIAL_SETTINGS } from "../../../../../../shared/constants/voxlab/material-constants.js";
import { SectionComponent, type SectionField } from "../../../panels/section/section-component.js";
import { STEP_TWENTIETH } from "../../../../../../shared/constants/voxlab/slider-step-constants.js";
import { pick, type EmissiveFields } from "../bundle/split-sections-types.js";
import { colorField, sliderField } from "../../section-field-factories.js";

const EMISSIVE_FIELDS: ReadonlyArray<SectionField<EmissiveFields>> = [
    colorField("emissiveColor", "Color"),
    sliderField({ key: "emissiveIntensity", label: "Intensity", min: 0, max: 3, step: STEP_TWENTIETH }),
];

export function createEmissiveSection(): SectionComponent<EmissiveFields> {
    return new SectionComponent<EmissiveFields>({
        snapshotName: "emissive",
        title: "Emissive",
        eventName: "emissive-change",
        defaults: pick(DEFAULT_MATERIAL_SETTINGS, ["emissiveColor", "emissiveIntensity"]),
        fields: EMISSIVE_FIELDS,
    });
}
