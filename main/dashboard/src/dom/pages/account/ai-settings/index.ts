import "./tabs";
import { button, div, heading, section, type Instance, baseProps } from "../../../factory";
import { tabDefs, type TabDef } from "./registry";

const CARD_CLASS = "account__card";
const CARD_VARIANT_CLASS = "account__card--ai-settings";
const SECTION_TITLE_CLASS = "account__section-title";
const TAB_NAV_CLASS = "clans-manage__tabs";
const TAB_CLASS = "clans-manage__tab";
const TAB_ACTIVE_CLASS = "clans-manage__tab--active";
const BODY_CLASS = "clans-manage__body";

function tabClasses(isActive: boolean): readonly string[] {
    return isActive ? [TAB_CLASS, TAB_ACTIVE_CLASS] : [TAB_CLASS];
}

function buildTabButton(key: string, label: string, isActive: boolean, onSelect: (k: string) => void): Instance {
    return button({
        classes: tabClasses(isActive),
        role: "tab",
        ariaSelected: isActive ? "true" : "false",
        data: { "tab-key": key },
        text: label,
        context: `switch to the ${label} tab`,
        meta: ["nav"],
        onClick: () => onSelect(key),
    });
}

function renderTabContent(host: Instance, key: string): void {
    host.clear();
    const def = tabDefs().find((d) => d.key === key);
    if (def !== undefined) def.mount(host);
}

interface TabMountArgs {
    tabs: readonly TabDef[];
    tabButtons: Map<string, Instance>;
    nav: Instance;
    active: string;
    selectTab: (k: string) => void;
}

function mountTabButtons(a: TabMountArgs): void {
    for (const def of a.tabs) {
        const btn = buildTabButton(def.key, def.label, def.key === a.active, a.selectTab);
        a.tabButtons.set(def.key, btn);
        a.nav.addChild(btn);
    }
}

interface AiCardState {
    activeRef: { v: string };
    body: Instance;
    nav: Instance;
    tabButtons: Map<string, Instance>;
}

function makeSelectTab(state: AiCardState): (next: string) => void {
    return (next: string): void => {
        if (next === state.activeRef.v) return;
        state.activeRef.v = next;
        state.body.el.dataset.activeTab = next;
        for (const [key, btn] of state.tabButtons) {
            const isActive = key === next;
            btn.el.classList.toggle(TAB_ACTIVE_CLASS, isActive);
            btn.setAttr("aria-selected", isActive ? "true" : "false");
        }
        renderTabContent(state.body, next);
    };
}

function aiCard(): Instance {
    const tabs = tabDefs();
    const state: AiCardState = {
        activeRef: { v: tabs[0]!.key },
        body: div({ classes: [BODY_CLASS], data: { "active-tab": tabs[0]!.key }, context: null, meta: null }),
        nav: div({ classes: [TAB_NAV_CLASS], role: "tablist", context: null, meta: null }),
        tabButtons: new Map<string, Instance>(),
    };
    const selectTab = makeSelectTab(state);
    mountTabButtons({ tabs, selectTab, tabButtons: state.tabButtons, nav: state.nav, active: state.activeRef.v });
    const card = section(baseProps([CARD_CLASS, CARD_VARIANT_CLASS]), [
        heading("h2", { classes: [SECTION_TITLE_CLASS], text: "AI Settings", context: null, meta: null }),
        state.nav,
        state.body,
    ]);
    renderTabContent(state.body, state.activeRef.v);
    return card;
}

export { aiCard };
