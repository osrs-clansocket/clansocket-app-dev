import {
    AXES_LENGTH_MAX,
    AXES_LENGTH_MIN,
    GRID_DIVISIONS_MAX,
    GRID_DIVISIONS_MIN,
    GRID_FLOOR_Y_MAX,
    GRID_FLOOR_Y_MIN,
    GRID_SIZE_MAX,
    GRID_SIZE_MIN,
} from "../../../../shared/constants/voxlab/effect-constants.js";
import { SectionComponent, type SectionField } from "../panels/section/section-component.js";
import { STEP_TWENTIETH } from "../../../../shared/constants/voxlab/slider-step-constants.js";
import { DEFAULT_GRID_AXES, type GridAxesFields } from "./split-sections/bundle/split-sections-types.js";
import { colorField, sliderField, toggleField } from "./section-field-factories.js";

const GRID_AXES_FIELDS: ReadonlyArray<SectionField<GridAxesFields>> = [
    toggleField("gridEnabled", "Show grid"),
    colorField("gridColor", "Grid color"),
    sliderField({ key: "gridSize", label: "Grid size", min: GRID_SIZE_MIN, max: GRID_SIZE_MAX, step: 0.5 }),
    sliderField({
        key: "gridDivisions",
        label: "Grid divisions",
        min: GRID_DIVISIONS_MIN,
        max: GRID_DIVISIONS_MAX,
        step: 1,
        formatValue: (n) => `${Math.round(n)}`,
    }),
    sliderField({
        key: "gridFloorY",
        label: "Grid floor Y",
        min: GRID_FLOOR_Y_MIN,
        max: GRID_FLOOR_Y_MAX,
        step: STEP_TWENTIETH,
    }),
    sliderField({
        key: "axesLength",
        label: "Axes length",
        min: AXES_LENGTH_MIN,
        max: AXES_LENGTH_MAX,
        step: STEP_TWENTIETH,
    }),
];

export function gridAxes(): SectionComponent<GridAxesFields> {
    return new SectionComponent<GridAxesFields>({
        snapshotName: "gridAxes",
        title: "Grid & Axes",
        eventName: "grid-axes-change",
        defaults: { ...DEFAULT_GRID_AXES },
        fields: GRID_AXES_FIELDS,
    });
}
