import { pathStep } from "../../../../state/voxlab/registries/snapshot-registry.js";
import { COLOR_SPACE_OPTIONS } from "../../../../shared/constants/voxlab/effect-constants.js";
import { SectionComponent, type SectionField } from "../panels/section/section-component.js";
import { DEFAULT_COLOR_SPACE, type ColorSpaceFields } from "./split-sections/bundle/split-sections-types.js";

export function colorSpace(): SectionComponent<ColorSpaceFields> {
    const fields: ReadonlyArray<SectionField<ColorSpaceFields>> = [
        {
            type: "dropdown",
            key: "colorSpace",
            options: COLOR_SPACE_OPTIONS,
            snapshotPath: pathStep("colorSpace", "colorSpace"),
        },
    ];
    return new SectionComponent<ColorSpaceFields>({
        snapshotName: "colorSpace",
        title: "Color Space",
        eventName: "color-space-change",
        defaults: { ...DEFAULT_COLOR_SPACE },
        fields,
    });
}
