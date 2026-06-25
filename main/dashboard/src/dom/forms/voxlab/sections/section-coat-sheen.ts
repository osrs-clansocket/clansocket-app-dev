import {
    ANISOTROPY_MAX,
    ANISOTROPY_MIN,
    CLEARCOAT_MAX,
    CLEARCOAT_MIN,
    CLEARCOAT_ROUGHNESS_MAX,
    CLEARCOAT_ROUGHNESS_MIN,
    DEFAULT_MATERIAL_SETTINGS,
    IOR_MAX,
    IOR_MIN,
    SHEEN_MAX,
    SHEEN_MIN,
} from "../../../../shared/constants/voxlab/material-constants.js";
import { SectionComponent, type SectionField } from "../panels/section/section-component.js";
import { STEP_HUNDREDTH } from "../../../../shared/constants/voxlab/slider-step-constants.js";
import { pick, type CoatSheenFields } from "./split-sections/bundle/split-sections-types.js";
import { colorField, sliderField } from "./section-field-factories.js";

function coatSheenSlider(
    key: keyof CoatSheenFields & string,
    label: string,
    min: number,
    max: number,
): SectionField<CoatSheenFields> {
    return sliderField<CoatSheenFields>({ key, label, min, max, step: STEP_HUNDREDTH });
}

const COAT_SHEEN_FIELDS: ReadonlyArray<SectionField<CoatSheenFields>> = [
    coatSheenSlider("clearcoat", "Clearcoat", CLEARCOAT_MIN, CLEARCOAT_MAX),
    coatSheenSlider("clearcoatRoughness", "Clearcoat roughness", CLEARCOAT_ROUGHNESS_MIN, CLEARCOAT_ROUGHNESS_MAX),
    coatSheenSlider("ior", "IOR", IOR_MIN, IOR_MAX),
    coatSheenSlider("sheen", "Sheen", SHEEN_MIN, SHEEN_MAX),
    colorField<CoatSheenFields>("sheenColor", "Sheen color"),
    coatSheenSlider("anisotropy", "Anisotropy", ANISOTROPY_MIN, ANISOTROPY_MAX),
];

export function coatSheen(): SectionComponent<CoatSheenFields> {
    return new SectionComponent<CoatSheenFields>({
        snapshotName: "coatSheen",
        title: "Coat & Sheen",
        eventName: "coat-sheen-change",
        defaults: pick(DEFAULT_MATERIAL_SETTINGS, [
            "clearcoat",
            "clearcoatRoughness",
            "ior",
            "sheen",
            "sheenColor",
            "anisotropy",
        ]),
        fields: COAT_SHEEN_FIELDS,
    });
}
