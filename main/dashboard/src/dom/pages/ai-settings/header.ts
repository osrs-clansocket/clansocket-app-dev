import { button, div, effect, header, span, textProps, type Instance } from "../../factory";
import {
    PAGE_BANNER_TAB_CLASS,
    PAGE_BANNER_TAB_ACTIVE_CLASS,
} from "../../../shared/constants/banner/banner-constants.js";
import { router } from "../../../managers/router";
import { TABS, activeTab$, type TabKey } from "./state.js";

const HEADER_CLASS = "ai-settings__header";
const BRAND_CLASS = "ai-settings__header-brand";
const TABLIST_CLASS = "ai-settings__tablist";

function buildTabBtn(key: TabKey, label: string): Instance<HTMLButtonElement> {
    const btn = button({
        classes: [PAGE_BANNER_TAB_CLASS],
        role: "tab",
        text: label,
        data: { "tab-key": key },
        ariaLabel: `Switch to the ${label} tab`,
        context: `switch to the ${label} tab`,
        meta: ["nav"],
        onClick: () => {
            router.navigate(`/ai-settings/${key}`);
        },
    });
    btn.trackDispose(
        effect(() => {
            const active = activeTab$() === key;
            btn.toggleClass(PAGE_BANNER_TAB_ACTIVE_CLASS, active);
            btn.setAttr("aria-selected", active ? "true" : "false");
        }),
    );
    return btn;
}

function buildTablist(): Instance {
    return div(
        {
            classes: [TABLIST_CLASS],
            role: "tablist",
            ariaLabel: "AI Settings sections",
            context: null,
            meta: null,
        },
        TABS.map((t) => buildTabBtn(t.key, t.label)),
    );
}

export function buildHeader(): Instance {
    const brand = span(textProps([BRAND_CLASS], "AI Settings"));
    return header({ classes: [HEADER_CLASS], context: null, meta: null }, [brand, buildTablist()]);
}
