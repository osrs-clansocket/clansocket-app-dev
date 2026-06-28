import { canvas, div, effect, type Instance, baseProps, span, textProps } from "../../../factory";
import { mount as mountChart, type SpecByKind } from "../../../../charts/factory.js";
import { chartRegistry } from "../../../../charts/registry.js";
import type { ChartMount } from "../../../../charts/types-chart.js";
import type { HomepageComponent } from "../../../../state/clans/homepage/types.js";
import type { HomepageContext } from "../../../../state/clans/homepage/homepage-variables.js";
import { CHART_PRESETS, type ChartPreset } from "../../../../state/clans/homepage/chart-presets.js";

const EMPTY_CLASS = "clans-home__chart-empty";
const WRAP_CLASS = "clans-home__chart-wrap";
const CANVAS_CLASS = "clans-home__chart-canvas";
const EMPTY_OVERLAY_CLASS = "clans-home__chart-no-data";
const RENDER_PIXEL_W = 960;
const RENDER_PIXEL_H = 540;
const THEME_VARS: ReadonlyArray<string> = [
    "--color",
    "--border-color",
    "--font-family",
    "--font-size",
    "--chart-primary",
    "--chart-text",
    "--chart-grid",
    "--chart-font-family",
    "--chart-text-muted",
];

function themeDigest(el: Element): string {
    const cs = getComputedStyle(el);
    const parts: string[] = [];
    for (const v of THEME_VARS) parts.push(cs.getPropertyValue(v).trim());
    return parts.join("|");
}

function emptyPlaceholder(message: string): Instance {
    return div(baseProps([EMPTY_CLASS]), [span(textProps([], message))]);
}

function sameLabels(a: readonly string[] | undefined, b: readonly string[]): boolean {
    if (a === undefined || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
}

function attachReactiveMount(
    host: Instance,
    canvasEl: HTMLCanvasElement,
    emptyEl: HTMLElement,
    preset: ChartPreset,
    ctx: HomepageContext,
): void {
    let mount: ChartMount | null = null;
    let prevX: readonly string[] | undefined;
    let prevY: readonly string[] | undefined;
    let lastSpec: SpecByKind[typeof preset.kind] | null = null;
    let lastThemeDigest = "";
    const showEmpty = (visible: boolean): void => {
        emptyEl.style.display = visible ? "" : "none";
        canvasEl.style.visibility = visible ? "hidden" : "";
    };
    const ensureMounted = (spec: SpecByKind[typeof preset.kind]): void => {
        if (mount === null) mount = mountChart(canvasEl, preset.kind, spec);
        else mount.update(spec);
    };
    const remountForTheme = (): void => {
        if (mount !== null) {
            chartRegistry.destroy(canvasEl);
            mount = null;
        }
        if (lastSpec !== null) ensureMounted(lastSpec);
    };
    host.trackDispose(
        effect(() => {
            const spec = preset.buildSpec(ctx);
            if (spec === null) {
                lastSpec = null;
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
            lastSpec = spec;
            ensureMounted(spec);
        }),
    );
    const styleObserver = new MutationObserver(() => {
        const parent = canvasEl.parentElement?.parentElement;
        if (parent === null || parent === undefined) return;
        const next = themeDigest(parent);
        if (next === lastThemeDigest) return;
        lastThemeDigest = next;
        remountForTheme();
    });
    queueMicrotask(() => {
        const parent = canvasEl.parentElement?.parentElement;
        if (parent === null || parent === undefined) return;
        lastThemeDigest = themeDigest(parent);
        styleObserver.observe(parent, { attributes: true, attributeFilter: ["style"] });
    });
    host.trackDispose({
        dispose: () => {
            styleObserver.disconnect();
            if (mount !== null) chartRegistry.destroy(canvasEl);
        },
    });
}

export function buildChart(ctx: HomepageContext, c: HomepageComponent): Instance {
    const presetId = c.payload.chartPresetId;
    if (presetId === undefined) return emptyPlaceholder("No chart preset bound");
    const preset = CHART_PRESETS.find((p) => p.id === presetId);
    if (preset === undefined) return emptyPlaceholder(`Unknown preset: ${presetId}`);
    const chartCanvas = canvas({
        chartKind: preset.kind,
        chartData: preset.id,
        chartKey: `homepage-chart-${c.componentId}`,
        width: RENDER_PIXEL_W,
        height: RENDER_PIXEL_H,
        classes: [CANVAS_CLASS],
        title: preset.label,
        context: `live chart: ${preset.label}`,
        meta: ["chart"],
    });
    const emptyOverlay = div(baseProps([EMPTY_OVERLAY_CLASS]), [span(textProps([], "No data yet"))]);
    emptyOverlay.el.style.display = "none";
    const wrap = div(baseProps([WRAP_CLASS]), [chartCanvas, emptyOverlay]);
    attachReactiveMount(wrap, chartCanvas.el, emptyOverlay.el, preset, ctx);
    return wrap;
}
