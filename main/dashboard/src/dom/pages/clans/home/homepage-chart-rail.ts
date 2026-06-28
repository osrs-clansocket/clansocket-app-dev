import { BTN_VARIANT_OUTLINE, baseProps, button, div, effect, type Instance, span, textProps } from "../../../factory";
import { signal, type Signal } from "../../../factory/reactive";
import { CHART_PRESETS, defaultSizeFor, type ChartPreset } from "../../../../state/clans/homepage/chart-presets.js";
import { chartRegistry } from "../../../../charts/registry.js";
import type { HomepageContext } from "../../../../state/clans/homepage/homepage-variables.js";
import type { EditorState } from "./homepage-editor-state.js";
import { chromeObserveSelectors, measureBottomGutter, measureChromeBottom } from "./homepage-rail-bounds.js";
import { buildChartRailTabs } from "./homepage-chart-rail-tabs.js";
import { buildChartRailCard, buildEmptyCard } from "./homepage-chart-rail-card.js";

const RAIL_CLASS = "clans-home__chart-rail";
const RAIL_OPEN_CLASS = "is-open";
const HEAD_CLASS = "clans-home__chart-rail-head";
const TITLE_CLASS = "clans-home__chart-rail-title";
const CLOSE_CLASS = "clans-home__chart-rail-close";
const BODY_CLASS = "clans-home__chart-rail-body";
const LIST_CLASS = "clans-home__chart-rail-list";

function categoriesOf(presets: ReadonlyArray<ChartPreset>): string[] {
    const set = new Set<string>();
    for (const p of presets) set.add(p.category);
    return [...set];
}

function buildList(ctx: HomepageContext, activeCategory$: Signal<string>, onPick: (id: string) => void): Instance {
    const list = div(baseProps([LIST_CLASS]));
    list.trackDispose(
        effect(() => {
            list.setChildren();
            chartRegistry.destroyAllIn(list.el);
            const cat = activeCategory$();
            const filtered = CHART_PRESETS.filter((p) => p.category === cat);
            if (filtered.length === 0) {
                list.addChild(buildEmptyCard("No charts in this category"));
                return;
            }
            for (const preset of filtered) list.addChild(buildChartRailCard(preset, ctx, onPick));
        }),
    );
    return list;
}

function buildClose(open$: Signal<boolean>): Instance {
    return button({
        variant: BTN_VARIANT_OUTLINE,
        classes: [CLOSE_CLASS],
        text: "×",
        ariaLabel: "Close charts rail",
        context: "close the charts rail",
        meta: ["action"],
        onClick: () => open$.set(false),
    });
}

export interface ChartRailOpts {
    readonly state: EditorState;
    readonly ctx: HomepageContext;
    readonly open$: Signal<boolean>;
}

export function buildChartRail(opts: ChartRailOpts): Instance {
    const { state, ctx, open$ } = opts;
    const categories = categoriesOf(CHART_PRESETS);
    const activeCategory$ = signal<string>(categories[0] ?? "highscores");
    const head = div(baseProps([HEAD_CLASS]), [span(textProps([TITLE_CLASS], "Charts")), buildClose(open$)]);
    const tabs = buildChartRailTabs(categories, activeCategory$);
    const onPick = (presetId: string): void => {
        const preset = CHART_PRESETS.find((p) => p.id === presetId);
        const size = preset?.recommendedSize ?? (preset !== undefined ? defaultSizeFor(preset.kind) : undefined);
        state.addChartFromPreset(presetId, size);
        open$.set(false);
    };
    const list = buildList(ctx, activeCategory$, onPick);
    const body = div(baseProps([BODY_CLASS]), [list]);
    const rail = div(baseProps([RAIL_CLASS]), [head, tabs, body]);
    const updateBounds = (): void => {
        rail.el.style.insetBlockStart = `${measureChromeBottom()}px`;
        rail.el.style.insetBlockEnd = `${measureBottomGutter()}px`;
    };
    const onResize = (): void => {
        if (open$()) updateBounds();
    };
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(() => onResize());
    for (const sel of chromeObserveSelectors()) {
        const el = document.querySelector(sel);
        if (el !== null) ro.observe(el);
    }
    rail.trackDispose(
        effect(() => {
            const isOpen = open$();
            rail.toggleClass(RAIL_OPEN_CLASS, isOpen);
            if (isOpen) requestAnimationFrame(updateBounds);
            else chartRegistry.destroyAllIn(rail.el);
        }),
    );
    rail.trackDispose({
        dispose: () => {
            window.removeEventListener("resize", onResize);
            ro.disconnect();
            chartRegistry.destroyAllIn(rail.el);
        },
    });
    return rail;
}
