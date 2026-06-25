import {
    CONTRAST_AMOUNT_MAX,
    CONTRAST_AMOUNT_MIN,
    DEFAULT_EFFECTS,
} from "../../../../../../shared/constants/voxlab/effect-constants.js";
import { SectionComponent, type SectionField } from "../../../panels/section/section-component.js";
import { STEP_HUNDREDTH } from "../../../../../../shared/constants/voxlab/slider-step-constants.js";
import { pick, type ContrastFields } from "../bundle/split-sections-types.js";
import { sliderField, toggleField } from "../../section-field-factories.js";

const CONTRAST_FIELDS: ReadonlyArray<SectionField<ContrastFields>> = [
    toggleField("contrastEnabled", "Contrast"),
    sliderField({
        key: "contrastAmount",
        label: "Amount",
        min: CONTRAST_AMOUNT_MIN,
        max: CONTRAST_AMOUNT_MAX,
        step: STEP_HUNDREDTH,
    }),
];

export function createContrastSection(): SectionComponent<ContrastFields> {
    return new SectionComponent<ContrastFields>({
        snapshotName: "contrast",
        title: "Contrast",
        eventName: "contrast-change",
        defaults: pick(DEFAULT_EFFECTS, ["contrastEnabled", "contrastAmount"]),
        fields: CONTRAST_FIELDS,
    });
}
