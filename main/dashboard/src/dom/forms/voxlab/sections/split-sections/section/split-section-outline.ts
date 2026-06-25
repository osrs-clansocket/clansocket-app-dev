import { DEFAULT_EFFECTS, OUTLINE_THICKNESS_MAX } from "../../../../../../shared/constants/voxlab/effect-constants.js";
import { SectionComponent, type SectionField } from "../../../panels/section/section-component.js";
import { definePanel } from "../../../../../../state/voxlab/registries/layout-panel-registry.js";
import { pick, type OutlineFields } from "../bundle/split-sections-types.js";
import { colorField, sliderField, toggleField } from "../../section-field-factories.js";

const OUTLINE_FIELDS: ReadonlyArray<SectionField<OutlineFields>> = [
    toggleField("outlineEnabled", "Outline"),
    colorField("outlineColor", "Color"),
    sliderField({ key: "outlineThickness", label: "Thickness", min: 0, max: OUTLINE_THICKNESS_MAX, step: 0.1 }),
];

export function createOutlineSection(): SectionComponent<OutlineFields> {
    return new SectionComponent<OutlineFields>({
        snapshotName: "outline",
        title: "Outline",
        eventName: "outline-change",
        defaults: pick(DEFAULT_EFFECTS, ["outlineEnabled", "outlineColor", "outlineThickness"]),
        fields: OUTLINE_FIELDS,
    });
}

definePanel({ id: "outline", title: "Outline", defaultSide: "left", order: 20, accessor: (f) => f.outline });
