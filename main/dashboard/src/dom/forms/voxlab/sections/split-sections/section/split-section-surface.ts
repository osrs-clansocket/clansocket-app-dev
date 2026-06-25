import { DEFAULT_MATERIAL_SETTINGS } from "../../../../../../shared/constants/voxlab/material-constants.js";
import { SectionComponent, type SectionField } from "../../../panels/section/section-component.js";
import { STEP_HUNDREDTH } from "../../../../../../shared/constants/voxlab/slider-step-constants.js";
import { pick, type SurfaceFields } from "../bundle/split-sections-types.js";
import { colorField, sliderField } from "../../section-field-factories.js";

function surfaceUnit(key: keyof SurfaceFields & string, label: string): SectionField<SurfaceFields> {
    return sliderField<SurfaceFields>({ key, label, min: 0, max: 1, step: STEP_HUNDREDTH });
}

const SURFACE_FIELDS: ReadonlyArray<SectionField<SurfaceFields>> = [
    colorField("tint", "Tint"),
    surfaceUnit("opacity", "Opacity"),
    surfaceUnit("metalness", "Metalness"),
    surfaceUnit("roughness", "Roughness"),
];

export function createSurfaceSection(): SectionComponent<SurfaceFields> {
    return new SectionComponent<SurfaceFields>({
        snapshotName: "surface",
        title: "Surface",
        eventName: "surface-change",
        defaults: pick(DEFAULT_MATERIAL_SETTINGS, ["tint", "opacity", "metalness", "roughness"]),
        fields: SURFACE_FIELDS,
    });
}
