import {
    DEFAULT_EFFECTS,
    VIGNETTE_AMOUNT_MAX,
    VIGNETTE_AMOUNT_MIN,
} from "../../../../../../shared/constants/voxlab/effect-constants.js";
import { SectionComponent, type SectionField } from "../../../panels/section/section-component.js";
import { STEP_HUNDREDTH } from "../../../../../../shared/constants/voxlab/slider-step-constants.js";
import { pick, type VignetteFields } from "./split-sections-types.js";
import { colorField, sliderField, toggleField } from "../../section-field-factories.js";

const VIGNETTE_FIELDS: ReadonlyArray<SectionField<VignetteFields>> = [
    toggleField("vignetteEnabled", "Vignette"),
    sliderField({
        key: "vignetteAmount",
        label: "Amount",
        min: VIGNETTE_AMOUNT_MIN,
        max: VIGNETTE_AMOUNT_MAX,
        step: STEP_HUNDREDTH,
    }),
    colorField("vignetteColor", "Color"),
];

export function createVignetteSection(): SectionComponent<VignetteFields> {
    return new SectionComponent<VignetteFields>({
        snapshotName: "vignette",
        title: "Vignette",
        eventName: "vignette-change",
        defaults: pick(DEFAULT_EFFECTS, ["vignetteEnabled", "vignetteAmount", "vignetteColor"]),
        fields: VIGNETTE_FIELDS,
    });
}
