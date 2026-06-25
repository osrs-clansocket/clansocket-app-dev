import { SectionComponent, type SectionField } from "../../../panels/section/section-component.js";
import { DEFAULT_SHADOWS, type ShadowsFields } from "../bundle/split-sections-types.js";
import { toggleField } from "../../section-field-factories.js";

export function createShadowsSection(): SectionComponent<ShadowsFields> {
    const fields: ReadonlyArray<SectionField<ShadowsFields>> = [toggleField("enabled", "Cast shadows")];
    return new SectionComponent<ShadowsFields>({
        snapshotName: "shadows",
        title: "Shadows",
        eventName: "shadows-change",
        defaults: { ...DEFAULT_SHADOWS },
        fields,
    });
}
