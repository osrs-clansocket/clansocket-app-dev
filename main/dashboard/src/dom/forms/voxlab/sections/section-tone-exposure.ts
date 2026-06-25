import { pathStep } from "../../../../state/voxlab/registries/snapshot-registry.js";
import {
    DEFAULT_EFFECTS,
    EXPOSURE_MAX,
    EXPOSURE_MIN,
    EXPOSURE_STEP,
    TONE_MAPPING_OPTIONS,
} from "../../../../shared/constants/voxlab/effect-constants.js";
import { SectionComponent, type SectionField } from "../panels/section/section-component.js";
import { pick, type ToneExposureFields } from "./split-sections/bundle/split-sections-types.js";
import { sliderField } from "./section-field-factories.js";

const TONE_EXPOSURE_FIELDS: ReadonlyArray<SectionField<ToneExposureFields>> = [
    {
        type: "dropdown",
        key: "toneMapping",
        options: TONE_MAPPING_OPTIONS,
        snapshotPath: pathStep("toneMapping", "toneMapping"),
    },
    sliderField({ key: "exposure", label: "Exposure", min: EXPOSURE_MIN, max: EXPOSURE_MAX, step: EXPOSURE_STEP }),
];

export function toneExposure(): SectionComponent<ToneExposureFields> {
    return new SectionComponent<ToneExposureFields>({
        snapshotName: "toneExposure",
        title: "Tone & Exposure",
        eventName: "tone-exposure-change",
        defaults: pick(DEFAULT_EFFECTS, ["toneMapping", "exposure"]),
        fields: TONE_EXPOSURE_FIELDS,
    });
}
