import { button, div, section, type Instance } from "../../../../factory/index.js";
import type { BaseVoxlabComponent } from "../../../../../managers/voxlab/base/base-voxlab-component.js";
import { SnapshotRegistry, snapshotRegistry } from "../../../../../state/voxlab/registries/snapshot-registry.js";
import {
    FOOTER_BTN_SECONDARY_CLASS,
    FOOTER_PANEL_ACTIONS_CLASS,
    FOOTER_PANEL_CLASS,
    FOOTER_PANEL_SECTIONS_CLASS,
    TABS_HOST_CLASS,
} from "../../../../../shared/constants/voxlab/voxlab-classes-constants.js";
import { TabBarComponent, type TabChangeDetail } from "../tab-bar-component.js";
import { loadTabSelection, saveTabSelection, TAB_DEFS } from "./footer-panel-tabs.js";
import { orderedSectionsOf, sectionsOf } from "./footer-panel-accessors.js";
import { resetFooterAll, unmountFooterAll } from "./footer-panel-lifecycle.js";
import { FooterContainersMixin } from "./footer-containers-mixin.js";

export class FooterPanelComponent extends FooterContainersMixin {
    private readonly tabBar = new TabBarComponent();
    readonly registry: SnapshotRegistry;
    private readonly headless: boolean;

    constructor(opts?: { headless?: boolean }) {
        super();
        this.headless = opts?.headless === true;
        this.registry = new SnapshotRegistry();
        for (const part of snapshotRegistry.all()) this.registry.register(part);
    }

    buildAllSections(): void {
        if (!this.headless) for (const section of sectionsOf(this, "all")) void section.element;
    }

    get sectionsInOrder(): ReadonlyArray<{ id: string; title: string; component: BaseVoxlabComponent }> {
        return orderedSectionsOf(this);
    }
    get lightSections(): ReadonlyArray<BaseVoxlabComponent> {
        return sectionsOf(this, "lightSections");
    }
    get cameraSections(): ReadonlyArray<BaseVoxlabComponent> {
        return sectionsOf(this, "cameraSections");
    }
    get sceneSections(): ReadonlyArray<BaseVoxlabComponent> {
        return sectionsOf(this, "sceneSections");
    }
    get meshSections(): ReadonlyArray<BaseVoxlabComponent> {
        return sectionsOf(this, "meshSections");
    }
    get colorSections(): ReadonlyArray<BaseVoxlabComponent> {
        return sectionsOf(this, "colorSections");
    }
    get textureSections(): ReadonlyArray<BaseVoxlabComponent> {
        return sectionsOf(this, "textureSections");
    }
    get displaySections(): ReadonlyArray<BaseVoxlabComponent> {
        return sectionsOf(this, "displaySections");
    }

    protected build(): HTMLElement {
        const initialTab = loadTabSelection();
        const panel = section({ classes: [FOOTER_PANEL_CLASS], context: null, meta: null });
        this.tabBar.setTabs(TAB_DEFS, initialTab);
        this.tabBar.mount(panel.el);
        for (const def of TAB_DEFS) {
            const host = this.buildTabHost(def.id, initialTab);
            this.hostsByTab.set(def.id, host);
            panel.addChild(host.el);
        }
        panel.addChild(this.buildActions().el);
        this.tabBar.addEventListener("tab-change", (e) => {
            const { id } = (e as CustomEvent<TabChangeDetail>).detail;
            this.activateTab(id);
            saveTabSelection(id);
        });
        return panel.el;
    }

    private buildTabHost(tabId: string, initialTab: string): Instance {
        const host = div({
            classes: [TABS_HOST_CLASS],
            data: { active: tabId === initialTab ? "true" : "false" },
            context: null,
            meta: null,
        });
        if (tabId === "effects") {
            this.panelsHostInstance = div({ classes: [FOOTER_PANEL_SECTIONS_CLASS], context: null, meta: null });
            host.addChild(this.panelsHostInstance.el);
        }
        return host;
    }

    private buildActions(): Instance {
        const resetButton = button({
            classes: [FOOTER_BTN_SECONDARY_CLASS],
            text: "Reset all",
            type: "button",
            context: "reset every voxlab section value back to its default",
            meta: ["action"],
            onClick: () => {
                resetFooterAll(this);
                this.emit<void>("reset-all", undefined);
            },
        });
        return div({ classes: [FOOTER_PANEL_ACTIONS_CLASS], context: null, meta: null }, [resetButton.el]);
    }

    private activateTab(activeId: string): void {
        for (const [tabId, instance] of this.hostsByTab)
            instance.setAttr("data-active", tabId === activeId ? "true" : "false");
    }

    protected onUnmount(): void {
        this.tabBar.unmount();
        unmountFooterAll(this);
    }
}
