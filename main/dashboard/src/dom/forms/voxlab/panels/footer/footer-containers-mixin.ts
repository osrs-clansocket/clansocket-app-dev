import { type Instance } from "../../../../factory/index.js";
import { FooterSectionsMixin } from "./footer-sections-mixin.js";

export abstract class FooterContainersMixin extends FooterSectionsMixin {
    protected readonly hostsByTab = new Map<string, Instance>();
    protected panelsHostInstance!: Instance;

    get panelsContainer(): HTMLElement {
        void this.root;
        return this.panelsHostInstance.el;
    }
    get presetsContainer(): HTMLElement {
        void this.root;
        return this.requireHost("presets");
    }
    get lightContainer(): HTMLElement {
        void this.root;
        return this.requireHost("light");
    }
    get animationsContainer(): HTMLElement {
        void this.root;
        return this.requireHost("animations");
    }
    get meshContainer(): HTMLElement {
        void this.root;
        return this.requireHost("mesh");
    }
    get colorContainer(): HTMLElement {
        void this.root;
        return this.requireHost("color");
    }
    get textureContainer(): HTMLElement {
        void this.root;
        return this.requireHost("texture");
    }
    protected requireHost(tabId: string): HTMLElement {
        const host = this.hostsByTab.get(tabId);
        if (!host) throw new Error(`voxlab footer: tab host '${tabId}' not built`);
        return host.el;
    }
}
