import { SectionComponent, type SectionField } from "../../../panels/section/section-component.js";
import { DEFAULT_SHADING, type ShadingFields } from "../bundle/split-sections-types.js";
import { toggleField } from "../../section-field-factories.js";

export function createShadingSection(): SectionComponent<ShadingFields> {
    const fields: ReadonlyArray<SectionField<ShadingFields>> = [
        toggleField("smoothShading", "Smooth shading"),
        toggleField("flatShading", "Flat shading"),
    ];
    return new SectionComponent<ShadingFields>({
        snapshotName: "shading",
        title: "Shading",
        eventName: "shading-change",
        defaults: { ...DEFAULT_SHADING },
        fields,
    });
}
