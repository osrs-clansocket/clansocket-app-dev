import type { StressSettings } from "../../../../../../shared/types/voxlab/stress-types.js";
import { SectionComponent, type SectionField } from "../../../panels/section/section-component.js";
import { STEP_HUNDREDTH, STEP_TWENTIETH } from "../../../../../../shared/constants/voxlab/slider-step-constants.js";
import { definePanel } from "../../../../../../state/voxlab/registries/layout-panel-registry.js";
import { DEFAULT_STRESS } from "./split-sections-types.js";
import { colorField, sliderField, toggleField } from "../../section-field-factories.js";

const STRESS_FIELDS: ReadonlyArray<SectionField<StressSettings>> = [
    toggleField("enabled", "Cursor glitch"),
    sliderField({ key: "radius", label: "Radius", min: STEP_TWENTIETH, max: 2, step: STEP_HUNDREDTH }),
    sliderField({ key: "lerp", label: "Smoothing", min: STEP_HUNDREDTH, max: 1, step: STEP_HUNDREDTH }),
    colorField("glowColor", "Glow"),
];

export function createStressSection(): SectionComponent<StressSettings> {
    return new SectionComponent<StressSettings>({
        snapshotName: "stress",
        title: "Stress",
        eventName: "stress-change",
        defaults: { ...DEFAULT_STRESS },
        fields: STRESS_FIELDS,
    });
}

definePanel({ id: "stress", title: "Stress", defaultSide: "left", order: 40, accessor: (f) => f.stress });
