import {
    DEFAULT_EFFECTS,
    MSAA_SAMPLES_MAX,
    MSAA_SAMPLES_MIN,
    MSAA_SAMPLES_STEP,
    SUPERSAMPLE_MAX,
    SUPERSAMPLE_MIN,
    SUPERSAMPLE_STEP,
} from "../../../../../../shared/constants/voxlab/effect-constants.js";
import { SectionComponent, type SectionField } from "../../../panels/section/section-component.js";
import { pick, type QualityFields } from "../bundle/split-sections-types.js";
import { sliderField, toggleField } from "../../section-field-factories.js";

const QUALITY_FIELDS: ReadonlyArray<SectionField<QualityFields>> = [
    toggleField("fxaaEnabled", "FXAA"),
    sliderField({
        key: "msaaSamples",
        label: "MSAA",
        min: MSAA_SAMPLES_MIN,
        max: MSAA_SAMPLES_MAX,
        step: MSAA_SAMPLES_STEP,
        formatValue: (n) => (n <= 0 ? "off" : `${Math.round(n)}×`),
    }),
    sliderField({
        key: "supersample",
        label: "Supersample",
        min: SUPERSAMPLE_MIN,
        max: SUPERSAMPLE_MAX,
        step: SUPERSAMPLE_STEP,
        formatValue: (n) => `${n.toFixed(2)}×`,
    }),
];

export function createQualitySection(): SectionComponent<QualityFields> {
    return new SectionComponent<QualityFields>({
        snapshotName: "quality",
        title: "Quality",
        eventName: "quality-change",
        defaults: pick(DEFAULT_EFFECTS, ["fxaaEnabled", "msaaSamples", "supersample"]),
        fields: QUALITY_FIELDS,
    });
}
