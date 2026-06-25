import { createInstance, type Instance } from "../../../dom/factory/index.js";

export abstract class BaseVoxlabComponent extends EventTarget {
    private rootInst: Instance | null = null;
    private mounted = false;

    protected abstract build(): HTMLElement;

    protected onMount(): void {}

    protected onUnmount(): void {}

    protected get root(): HTMLElement {
        return this.resolveRootInstance.el;
    }

    private get resolveRootInstance(): Instance {
        if (!this.rootInst) {
            this.rootInst = createInstance(this.build());
        }
        return this.rootInst;
    }

    mount(parent: HTMLElement): void {
        if (this.mounted) return;
        this.mounted = true;
        this.resolveRootInstance.mount(parent);
        this.onMount();
    }

    unmount(): void {
        if (!this.mounted) return;
        this.mounted = false;
        this.onUnmount();
        this.rootInst?.destroy();
        this.rootInst = null;
    }

    get element(): HTMLElement {
        return this.root;
    }

    protected emit<T>(type: string, detail: T): void {
        this.dispatchEvent(new CustomEvent<T>(type, { detail }));
    }
}
