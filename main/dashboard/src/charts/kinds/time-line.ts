import type { ChartConfiguration, ChartOptions } from "chart.js";
import { ensureCoreRegistered, ensureZoomRegistered, Chart } from "../plugins";
import { getChartTheme } from "../theme";
import { dropEmptySeries } from "../filters/series-filter.js";
import { unitForWindow } from "../mappers/window-unit-mapper.js";
import { chartRegistry } from "../registry";
import type { ChartMount } from "../types-chart.js";
import type { ChartTheme } from "../types-theme.js";
import type { TimeLineData } from "../types-series.js";
import { ENABLED, DISABLED, ANIM_DURATION } from "./flags";
import { LINE_TYPE, type LineKind } from "./time-line-kind.js";
import { tooltipLabel, tooltipTitle } from "./time-line-tooltip.js";
import { buildZoomConfig } from "./time-line-zoom.js";
import { buildDataset } from "./time-line-dataset.js";

interface TimeLineSpec {
    data: TimeLineData;
    window?: string;
    minimal?: boolean;
}

const DECIMATION_SAMPLES = 120;

function buildDatasets(spec: TimeLineSpec, palette: string[]) {
    const series = dropEmptySeries(spec.data.series);
    const minimal = spec.minimal === ENABLED;
    return series.map((s, i) => buildDataset(s, palette[i % palette.length]!, minimal));
}

function buildOptions(spec: TimeLineSpec, theme: ChartTheme): ChartOptions<LineKind> {
    const minimal = spec.minimal === ENABLED;
    const unit = unitForWindow(spec.window ?? "24h");
    const axis = {
        grid: { display: !minimal, color: theme.grid },
        ticks: { display: !minimal, color: theme.textMuted },
        display: !minimal,
    };
    return {
        responsive: ENABLED,
        maintainAspectRatio: DISABLED,
        interaction: { mode: "nearest" as const, axis: "x" as const, intersect: DISABLED },
        animation: minimal ? DISABLED : { duration: ANIM_DURATION },
        plugins: {
            legend: { display: !minimal },
            tooltip: { enabled: !minimal, callbacks: { title: tooltipTitle, label: tooltipLabel } },
            decimation: { enabled: ENABLED, algorithm: "lttb" as const, samples: DECIMATION_SAMPLES },
            zoom: buildZoomConfig(minimal),
        },
        scales: {
            x: { type: "time", time: { unit }, ...axis },
            y: { ...axis, beginAtZero: minimal },
        },
    };
}

function createTimeLine(canvas: HTMLCanvasElement, spec: TimeLineSpec): ChartMount {
    ensureCoreRegistered();
    if (spec.minimal !== ENABLED) ensureZoomRegistered();
    const theme = getChartTheme(canvas);
    const config: ChartConfiguration<LineKind> = {
        type: LINE_TYPE,
        data: { datasets: buildDatasets(spec, theme.palette) },
        options: buildOptions(spec, theme),
    };
    const chart = new Chart(canvas, config);
    const mount: ChartMount = {
        destroy() {
            chart.destroy();
        },
        update(next: unknown) {
            chart.data.datasets = buildDatasets(next as TimeLineSpec, theme.palette);
            chart.update("none");
        },
    };
    chartRegistry.track(canvas, mount);
    return mount;
}

export { createTimeLine };
export type { TimeLineSpec };
