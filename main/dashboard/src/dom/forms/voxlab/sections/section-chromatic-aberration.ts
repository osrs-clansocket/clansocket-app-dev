import {
    CHROMATIC_ABERRATION_AMOUNT_MAX,
    CHROMATIC_ABERRATION_AMOUNT_MIN,
    DEFAULT_EFFECTS,
} from "../../../../shared/constants/voxlab/effect-constants.js";
import { SectionComponent, type SectionField } from "../panels/section/section-component.js";
import { STEP_HUNDREDTH } from "../../../../shared/constants/voxlab/slider-step-constants.js";
import { definePanel } from "../../../../state/voxlab/registries/layout-panel-registry.js";
import { pick, type ChromaticAberrationFields } from "./split-sections/bundle/split-sections-types.js";
import { sliderField, toggleField } from "./section-field-factories.js";

const CHROMATIC_ABERRATION_FIELDS: ReadonlyArray<SectionField<ChromaticAberrationFields>> = [
    toggleField("chromaticAberrationEnabled", "Chromatic aberration"),
    sliderField({
        key: "chromaticAberrationAmount",
        label: "Amount",
        min: CHROMATIC_ABERRATION_AMOUNT_MIN,
        max: CHROMATIC_ABERRATION_AMOUNT_MAX,
        step: STEP_HUNDREDTH,
    }),
];

export function chromaticAberration(): SectionComponent<ChromaticAberrationFields> {
    return new SectionComponent<ChromaticAberrationFields>({
        snapshotName: "chromaticAberration",
        title: "Chromatic Aberration",
        eventName: "chromatic-aberration-change",
        defaults: pick(DEFAULT_EFFECTS, ["chromaticAberrationEnabled", "chromaticAberrationAmount"]),
        fields: CHROMATIC_ABERRATION_FIELDS,
    });
}

definePanel({
    id: "chromatic-aberration",
    title: "Chromatic Aberration",
    defaultSide: "left",
    order: 30,
    accessor: (f) => f.chromaticAberration,
});
