import { asideEl, button, div, type Instance } from "../../../factory/index.js";
import { BaseVoxlabComponent } from "../../../../managers/voxlab/base/base-voxlab-component.js";
import {
    SIDEBAR_CLASS,
    SIDEBAR_PUBLISH_BTN_CLASS,
    TABS_HOST_CLASS,
} from "../../../../shared/constants/voxlab/voxlab-classes-constants.js";
import { ExportPanelComponent } from "./export-panel-component.js";
import { StatsPanelComponent } from "./stats-panel-component.js";
import { TabBarComponent, type TabChangeDetail } from "./tab-bar-component.js";
import { TAB_DEFS, loadTabSelection, saveTabSelection } from "./sidebar-tabs.js";

export class SidebarComponent extends BaseVoxlabComponent {
    readonly statsPanel = new StatsPanelComponent();
    readonly exportPanel = new ExportPanelComponent();
    private readonly tabBar = new TabBarComponent();
    private readonly hostsByTab = new Map<string, Instance>();
    private publishButton!: Instance<HTMLButtonElement>;

    get displayContainer(): HTMLElement {
        void this.root;
        return this.requireHost("display");
    }

    get cameraContainer(): HTMLElement {
        void this.root;
        return this.requireHost("camera");
    }

    get sceneContainer(): HTMLElement {
        void this.root;
        return this.requireHost("scene");
    }

    get exportContainer(): HTMLElement {
        void this.root;
        return this.requireHost("export");
    }

    get actionsContainer(): HTMLElement {
        void this.root;
        return this.requireHost("actions");
    }

    private requireHost(tabId: string): HTMLElement {
        const host = this.hostsByTab.get(tabId);
        if (!host) {
            throw new Error(`voxlab sidebar: tab host '${tabId}' not built`);
        }
        return host.el;
    }

    private buildPublishBtn(): Instance<HTMLButtonElement> {
        return button({
            classes: [SIDEBAR_PUBLISH_BTN_CLASS],
            text: "Publish",
            type: "button",
            disabled: "true",
            context: "publish the voxlab clan logo as a voxlab record",
            meta: ["action", "clan"],
            onClick: () => this.emit<void>("publish-requested", undefined),
        });
    }

    private buildTabHosts(initialTab: string, aside: Instance): void {
        for (const def of TAB_DEFS) {
            const host = div({
                classes: [TABS_HOST_CLASS],
                data: { active: def.id === initialTab ? "true" : "false" },
                context: null,
                meta: null,
            });
            this.hostsByTab.set(def.id, host);
            aside.addChild(host.el);
        }
    }

    protected build(): HTMLElement {
        const aside = asideEl({ classes: [SIDEBAR_CLASS], context: null, meta: null });
        this.publishButton = this.buildPublishBtn();
        aside.addChild(this.publishButton.el);
        const initialTab = loadTabSelection();
        this.tabBar.setTabs(TAB_DEFS, initialTab);
        this.tabBar.mount(aside.el);
        this.buildTabHosts(initialTab, aside);
        this.exportPanel.mount(this.requireHost("export"));
        this.tabBar.addEventListener("tab-change", (e) => {
            const { id } = (e as CustomEvent<TabChangeDetail>).detail;
            this.activateTab(id);
            saveTabSelection(id);
        });
        return aside.el;
    }

    private activateTab(activeId: string): void {
        for (const [tabId, instance] of this.hostsByTab) {
            instance.setAttr("data-active", tabId === activeId ? "true" : "false");
        }
    }

    setExportEnabled(enabled: boolean): void {
        this.exportPanel.setEnabled(enabled);
    }

    setPublishEnabled(enabled: boolean): void {
        this.publishButton.setAttr("disabled", enabled ? null : "true");
    }

    setPublishBusy(busy: boolean): void {
        this.publishButton.setAttr("disabled", busy ? "true" : null);
        this.publishButton.setText(busy ? "Publishing…" : "Publish");
    }

    protected onUnmount(): void {
        this.tabBar.unmount();
        this.statsPanel.unmount();
        this.exportPanel.unmount();
    }
}
