import type { ChartCanvas, ChartKind, ChartMount } from "./types-chart.js";

const mounted = new WeakMap<HTMLCanvasElement, ChartMount>();

export const chartRegistry = {
    discover(root: ParentNode): ChartCanvas[] {
        const canvases = root.querySelectorAll<HTMLCanvasElement>("canvas[data-chart-kind]");
        const out: ChartCanvas[] = [];
        canvases.forEach((canvas) => {
            const kind = canvas.dataset.chartKind as ChartKind | undefined;
            if (!kind) return;
            out.push({
                canvas,
                kind,
                dataKey: canvas.dataset.chartData ?? "",
                key: canvas.dataset.chartKey ?? "",
            });
        });
        return out;
    },
    track(canvas: HTMLCanvasElement, mount: ChartMount): void {
        const existing = mounted.get(canvas);
        if (existing) existing.destroy();
        mounted.set(canvas, mount);
    },
    get(canvas: HTMLCanvasElement): ChartMount | undefined {
        return mounted.get(canvas);
    },
    destroy(canvas: HTMLCanvasElement): void {
        const m = mounted.get(canvas);
        if (m) {
            m.destroy();
            mounted.delete(canvas);
        }
    },
    destroyAllIn(root: ParentNode): void {
        chartRegistry.discover(root).forEach((c) => chartRegistry.destroy(c.canvas));
    },
};
