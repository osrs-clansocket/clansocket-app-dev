import type { TimeLineSpec } from "./kinds/time-line";
import type { BarSpec } from "./kinds/bar";
import type { DoughnutSpec } from "./kinds/doughnut";
import type { RadarSpec } from "./kinds/radar";
import type { HeatmapSpec } from "./kinds/heatmap";

export type SpecByKind = {
    "time-line": TimeLineSpec;
    bar: BarSpec;
    doughnut: DoughnutSpec;
    radar: RadarSpec;
    heatmap: HeatmapSpec;
};

export type AnySpec = SpecByKind[keyof SpecByKind];
