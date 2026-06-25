import { DEFAULT_EFFECTS } from "../../../../../../shared/constants/voxlab/effect-constants.js";
import { SectionComponent, type SectionField } from "../../../panels/section/section-component.js";
import { pick, type BackgroundFields } from "../bundle/split-sections-types.js";
import { colorField } from "../../section-field-factories.js";

export function createBackgroundSection(): SectionComponent<BackgroundFields> {
    const fields: ReadonlyArray<SectionField<BackgroundFields>> = [colorField("backgroundColor", "Background")];
    return new SectionComponent<BackgroundFields>({
        snapshotName: "background",
        title: "Background",
        eventName: "background-change",
        defaults: pick(DEFAULT_EFFECTS, ["backgroundColor"]),
        fields,
    });
}
