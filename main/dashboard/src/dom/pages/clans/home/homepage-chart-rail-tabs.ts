import { BTN_VARIANT_OUTLINE, baseProps, button, div, effect, type Instance } from "../../../factory";
import type { Signal } from "../../../factory/reactive";

const TABS_CLASS = "clans-home__chart-rail-tabs";
const TAB_CLASS = "clans-home__chart-rail-tab";
const TAB_ACTIVE_CLASS = "is-active";

export function buildChartRailTabs(categories: readonly string[], activeCategory$: Signal<string>): Instance {
    const tabs = div(baseProps([TABS_CLASS]));
    for (const cat of categories) {
        const tab = button({
            variant: BTN_VARIANT_OUTLINE,
            classes: [TAB_CLASS],
            text: cat,
            ariaLabel: `Show ${cat} charts`,
            context: `show ${cat} charts`,
            meta: ["action"],
            onClick: () => activeCategory$.set(cat),
        });
        tab.trackDispose(
            effect(() => {
                tab.toggleClass(TAB_ACTIVE_CLASS, activeCategory$() === cat);
            }),
        );
        tabs.addChild(tab);
    }
    return tabs;
}
