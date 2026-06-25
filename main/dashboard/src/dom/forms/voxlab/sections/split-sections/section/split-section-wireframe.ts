import { SectionComponent, type SectionField } from "../../../panels/section/section-component.js";
import { STEP_HUNDREDTH } from "../../../../../../shared/constants/voxlab/slider-step-constants.js";
import { DEFAULT_WIREFRAME, type WireframeFields } from "../bundle/split-sections-types.js";
import { colorField, sliderField, toggleField } from "../../section-field-factories.js";

export function createWireframeSection(): SectionComponent<WireframeFields> {
    const fields: ReadonlyArray<SectionField<WireframeFields>> = [
        toggleField("enabled", "Wireframe overlay"),
        colorField("color", "Color"),
        sliderField({ key: "opacity", label: "Opacity", min: 0, max: 1, step: STEP_HUNDREDTH }),
    ];
    return new SectionComponent<WireframeFields>({
        snapshotName: "wireframe",
        title: "Wireframe",
        eventName: "wireframe-change",
        defaults: { ...DEFAULT_WIREFRAME },
        fields,
    });
}
