export type ChartKind =
    | "kpi-tile"
    | "time-line"
    | "multi-line"
    | "doughnut"
    | "radar"
    | "bar"
    | "heatmap"
    | "milestone-timeline";

export type StatusLevel = "ok" | "warn" | "danger" | "none";

export interface ChartCanvas {
    canvas: HTMLCanvasElement;
    kind: ChartKind;
    dataKey: string;
    key: string;
}

export interface ChartMount {
    destroy(): void;
    update(data: unknown): void;
}
