import {
    PIXEL_RATIO_MAX,
    PIXEL_RATIO_MIN,
    PIXEL_RATIO_STEP,
} from "../../../../shared/constants/voxlab/effect-constants.js";
import { SectionComponent, type SectionField } from "../panels/section/section-component.js";
import { DEFAULT_PIXEL_RATIO, type PixelRatioFields } from "./split-sections/bundle/split-sections-types.js";
import { sliderField } from "./section-field-factories.js";

export function pixelRatio(): SectionComponent<PixelRatioFields> {
    const fields: ReadonlyArray<SectionField<PixelRatioFields>> = [
        sliderField({
            key: "pixelRatio",
            label: "Pixel ratio",
            min: PIXEL_RATIO_MIN,
            max: PIXEL_RATIO_MAX,
            step: PIXEL_RATIO_STEP,
            formatValue: (n) => `${n.toFixed(1)}×`,
        }),
    ];
    return new SectionComponent<PixelRatioFields>({
        snapshotName: "pixelRatio",
        title: "Pixel Ratio",
        eventName: "pixel-ratio-change",
        defaults: { ...DEFAULT_PIXEL_RATIO },
        fields,
    });
}
