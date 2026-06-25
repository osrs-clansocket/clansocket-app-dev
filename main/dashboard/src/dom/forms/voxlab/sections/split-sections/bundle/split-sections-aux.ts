import {
    DEFAULT_BOTTOM_LIGHT,
    DEFAULT_TOP_LIGHT,
    LIGHT_INTENSITY_MAX,
} from "../../../../../../shared/constants/voxlab/lighting/light-constants.js";
import type { BottomLightSettings, TopLightSettings } from "../../../../../../shared/types/voxlab/light-types.js";
import { SectionComponent, type SectionField } from "../../../panels/section/section-component.js";
import { STEP_HUNDREDTH } from "../../../../../../shared/constants/voxlab/slider-step-constants.js";
import { colorField, sliderField } from "../../section-field-factories.js";

function intensityColorFields<T extends { intensity: number; color: string }>(): ReadonlyArray<SectionField<T>> {
    return [
        sliderField<T>({
            key: "intensity",
            label: "Intensity",
            min: 0,
            max: LIGHT_INTENSITY_MAX,
            step: STEP_HUNDREDTH,
        }),
        colorField<T>("color", "Color"),
    ];
}

export function topLight(): SectionComponent<TopLightSettings> {
    return new SectionComponent<TopLightSettings>({
        snapshotName: "topLight",
        title: "Top Light",
        eventName: "top-light-change",
        defaults: { ...DEFAULT_TOP_LIGHT },
        fields: intensityColorFields<TopLightSettings>(),
    });
}

export function bottomLight(): SectionComponent<BottomLightSettings> {
    return new SectionComponent<BottomLightSettings>({
        snapshotName: "bottomLight",
        title: "Bottom Kicker",
        eventName: "bottom-light-change",
        defaults: { ...DEFAULT_BOTTOM_LIGHT },
        fields: intensityColorFields<BottomLightSettings>(),
    });
}
