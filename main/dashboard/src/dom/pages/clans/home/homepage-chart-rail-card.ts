import { canvas, div, effect, type Instance, baseProps, span, textProps } from "../../../factory";
import { mount as mountChart, type SpecByKind } from "../../../../charts/factory.js";
import { chartRegistry } from "../../../../charts/registry.js";
import type { ChartMount } from "../../../../charts/types-chart.js";
import type { HomepageContext } from "../../../../state/clans/homepage/homepage-variables.js";
import type { ChartPreset } from "../../../../state/clans/homepage/chart-presets.js";

const CARD_CLASS = "clans-home__chart-rail-card";
const PREVIEW_CANVAS_CLASS = "clans-home__chart-preview-canvas";
const EMPTY_CLASS = "clans-home__chart-preview-empty";
const NO_DATA_CLASS = "clans-home__chart-no-data";
const LABEL_CLASS = "clans-home__chart-rail-card-label";
const DESC_CLASS = "clans-home__chart-rail-card-desc";
const PREVIEW_PIXEL_W = 560;
const PREVIEW_PIXEL_H = 240;

function sameLabels(a: readonly string[] | undefined, b: readonly string[]): boolean {
    if (a === undefined || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
}

function attachPreview(
    host: Instance,
    canvasEl: HTMLCanvasElement,
    emptyEl: HTMLElement,
    preset: ChartPreset,
    ctx: HomepageContext,
): void {
    let mount: ChartMount | null = null;
    let prevX: readonly string[] | undefined;
    let prevY: readonly string[] | undefined;
    const showEmpty = (visible: boolean): void => {
        emptyEl.style.display = visible ? "" : "none";
        canvasEl.style.visibility = visible ? "hidden" : "";
    };
    host.trackDispose(
        effect(() => {
            const spec = preset.buildSpec(ctx);
            if (spec === null) {
                if (mount !== null) {
                    chartRegistry.destroy(canvasEl);
                    mount = null;
                }
                showEmpty(true);
                return;
            }
            showEmpty(false);
            if (preset.kind === "heatmap") {
                const hs = spec as SpecByKind["heatmap"];
                if (mount !== null && (!sameLabels(prevX, hs.xLabels) || !sameLabels(prevY, hs.yLabels))) {
                    chartRegistry.destroy(canvasEl);
                    mount = null;
                }
                prevX = hs.xLabels;
                prevY = hs.yLabels;
            }
            if (mount === null) mount = mountChart(canvasEl, preset.kind, spec);
            else mount.update(spec);
        }),
    );
    host.trackDispose({
        dispose: () => {
            if (mount !== null) chartRegistry.destroy(canvasEl);
        },
    });
}

export function buildChartRailCard(preset: ChartPreset, ctx: HomepageContext, onPick: (id: string) => void): Instance {
    const previewCanvas = canvas({
        chartKind: preset.kind,
        chartData: preset.id,
        chartKey: `homepage-chart-preview-${preset.id}`,
        width: PREVIEW_PIXEL_W,
        height: PREVIEW_PIXEL_H,
        classes: [PREVIEW_CANVAS_CLASS],
        title: preset.label,
        context: `preview of ${preset.label}`,
        meta: ["chart"],
    });
    const label = span(textProps([LABEL_CLASS], preset.label));
    const desc = span(textProps([DESC_CLASS], preset.description));
    const emptyOverlay = div(baseProps([NO_DATA_CLASS]), [span(textProps([], "No data yet"))]);
    emptyOverlay.el.style.display = "none";
    const card = div(
        {
            classes: [CARD_CLASS],
            ariaLabel: `Add ${preset.label} chart`,
            title: preset.description,
            context: `add ${preset.label} chart to the page`,
            meta: ["action"],
            onClick: () => onPick(preset.id),
        },
        [previewCanvas, emptyOverlay, label, desc],
    );
    attachPreview(card, previewCanvas.el, emptyOverlay.el, preset, ctx);
    return card;
}

export function buildEmptyCard(message: string): Instance {
    return div(baseProps([EMPTY_CLASS]), [span(textProps([], message))]);
}
