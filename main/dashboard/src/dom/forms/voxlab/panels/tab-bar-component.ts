import { button, div, type Instance } from "../../../factory/index.js";
import { BaseVoxlabComponent } from "../../../../managers/voxlab/base/base-voxlab-component.js";

const CLS_TABS = "voxlab__tabs";
const CLS_TAB_BTN = "voxlab__tabs-btn";

export interface TabSpec {
    id: string;
    label: string;
}

export interface TabChangeDetail {
    id: string;
}

export class TabBarComponent extends BaseVoxlabComponent {
    private tabs: TabSpec[] = [];
    private activeId = "";
    private buttonsByid = new Map<string, HTMLButtonElement>();
    private container!: Instance;

    setTabs(tabs: ReadonlyArray<TabSpec>, initialActive: string): void {
        this.tabs = [...tabs];
        this.activeId = initialActive;
        this.rebuild();
    }

    setActive(id: string): void {
        if (this.activeId === id) return;
        this.activeId = id;
        for (const [tabId, btn] of this.buttonsByid.entries()) {
            btn.dataset.active = tabId === id ? "true" : "false";
        }
        this.emit<TabChangeDetail>("tab-change", { id });
    }

    get active(): string {
        return this.activeId;
    }

    protected build(): HTMLElement {
        this.container = div({ classes: [CLS_TABS], context: null, meta: null });
        this.rebuild();
        return this.container.el;
    }

    private rebuild(): void {
        if (!this.container) return;
        this.buttonsByid.clear();
        const buttons: Instance<HTMLButtonElement>[] = [];
        for (const tab of this.tabs) {
            const btn = button({
                classes: [CLS_TAB_BTN],
                text: tab.label,
                onClick: () => this.setActive(tab.id),
                context: `switch to tab ${tab.id}`,
                meta: ["nav"],
            });
            btn.el.dataset.active = tab.id === this.activeId ? "true" : "false";
            buttons.push(btn);
            this.buttonsByid.set(tab.id, btn.el);
        }
        this.container.setChildren(...buttons);
    }
}
