import {
    BLOOM_RADIUS_MAX,
    BLOOM_STRENGTH_MAX,
    BLOOM_THRESHOLD_MAX,
    DEFAULT_EFFECTS,
} from "../../../../../../shared/constants/voxlab/effect-constants.js";
import { SectionComponent, type SectionField } from "../../../panels/section/section-component.js";
import { STEP_HUNDREDTH, STEP_TWENTIETH } from "../../../../../../shared/constants/voxlab/slider-step-constants.js";
import { pick, type BloomFields } from "./split-sections-types.js";
import { sliderField, toggleField } from "../../section-field-factories.js";

const BLOOM_FIELDS: ReadonlyArray<SectionField<BloomFields>> = [
    toggleField("bloomEnabled", "Bloom"),
    sliderField({ key: "bloomStrength", label: "Strength", min: 0, max: BLOOM_STRENGTH_MAX, step: STEP_TWENTIETH }),
    sliderField({ key: "bloomRadius", label: "Radius", min: 0, max: BLOOM_RADIUS_MAX, step: STEP_HUNDREDTH }),
    sliderField({ key: "bloomThreshold", label: "Threshold", min: 0, max: BLOOM_THRESHOLD_MAX, step: STEP_HUNDREDTH }),
];

export function createBloomSection(): SectionComponent<BloomFields> {
    return new SectionComponent<BloomFields>({
        snapshotName: "bloom",
        title: "Bloom",
        eventName: "bloom-change",
        defaults: pick(DEFAULT_EFFECTS, ["bloomEnabled", "bloomStrength", "bloomRadius", "bloomThreshold"]),
        fields: BLOOM_FIELDS,
    });
}
