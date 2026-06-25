import type { ChartKind, ChartMount } from "./types-chart.js";
import { createTimeLine } from "./kinds/time-line";
import { createBar } from "./kinds/bar";
import { createDoughnut } from "./kinds/doughnut";
import { createRadar } from "./kinds/radar";
import { createHeatmap } from "./kinds/heatmap";
import type { SpecByKind } from "./factory-types.js";

const mountByKind: {
    [K in keyof SpecByKind]: (canvas: HTMLCanvasElement, spec: SpecByKind[K]) => ChartMount;
} = {
    "time-line": createTimeLine,
    bar: createBar,
    doughnut: createDoughnut,
    radar: createRadar,
    heatmap: createHeatmap,
};

export function isSupportedKind(kind: ChartKind): kind is keyof SpecByKind {
    return kind in mountByKind;
}

export function mount<K extends keyof SpecByKind>(canvas: HTMLCanvasElement, kind: K, spec: SpecByKind[K]): ChartMount {
    return mountByKind[kind](canvas, spec);
}
