import type { BaseVoxlabComponent } from "../base/base-voxlab-component.js";
import {
    LayoutShellComponent,
    type ShellActionDetail,
} from "../../../dom/forms/voxlab/panels/layout-shell-component.js";
import { LayoutPersistenceService } from "../services/layout-persistence-service.js";
import { collectMoveKnown, findEntry, move, findSwapSide } from "./layout-manager-actions.js";
import {
    LAYOUT_SCHEMA_VERSION,
    type LayoutEntry,
    type LayoutSide,
    type LayoutState,
} from "../../../shared/types/voxlab/layout-types.js";

export interface ContainerRegistration {
    id: string;
    title: string;
    component: BaseVoxlabComponent;
    defaultSide: LayoutSide;
}

interface MountedShell {
    id: string;
    shell: LayoutShellComponent;
    component: BaseVoxlabComponent;
    collapsed: boolean;
    side: LayoutSide;
}

export class LayoutManager {
    private readonly registrations = new Map<string, ContainerRegistration>();
    private readonly persistence: LayoutPersistenceService;
    private shells = new Map<string, MountedShell>();
    private leftHost: HTMLElement | null = null;
    private rightHost: HTMLElement | null = null;
    private state: LayoutState | null = null;

    constructor(persistence?: LayoutPersistenceService) {
        this.persistence = persistence ?? new LayoutPersistenceService();
    }

    register(entry: ContainerRegistration): void {
        this.registrations.set(entry.id, entry);
    }

    attach(hosts: { left: HTMLElement; right: HTMLElement }): void {
        this.leftHost = hosts.left;
        this.rightHost = hosts.right;
        const stored = this.persistence.load();
        this.state = this.normalise(stored);
        this.render();
    }

    private normalise(stored: LayoutState | null): LayoutState {
        const known = new Set(this.registrations.keys());
        const seen = new Set<string>();
        const left = collectMoveKnown(stored?.left, known, seen);
        const right = collectMoveKnown(stored?.right, known, seen);
        for (const reg of this.registrations.values()) {
            if (seen.has(reg.id)) continue;
            (reg.defaultSide === "left" ? left : right).push({ id: reg.id, collapsed: false });
        }
        return { schemaVersion: LAYOUT_SCHEMA_VERSION, left, right };
    }

    private render(): void {
        if (!this.state || !this.leftHost || !this.rightHost) return;
        for (const mounted of this.shells.values()) {
            mounted.component.unmount();
            mounted.shell.unmount();
        }
        this.shells.clear();
        this.renderSide("left", this.leftHost, this.state.left);
        this.renderSide("right", this.rightHost, this.state.right);
    }

    private renderSide(side: LayoutSide, host: HTMLElement, entries: LayoutEntry[]): void {
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const reg = this.registrations.get(entry.id);
            if (!reg) continue;
            const shell = new LayoutShellComponent({
                side,
                id: reg.id,
                title: reg.title,
                collapsed: entry.collapsed,
            });
            shell.mount(host);
            reg.component.mount(shell.body);
            shell.setMovability(i > 0, i < entries.length - 1);
            shell.addEventListener("shell-action", (e) => {
                const detail = (e as CustomEvent<ShellActionDetail>).detail;
                this.handleAction(detail);
            });
            this.shells.set(reg.id, { shell, side, id: reg.id, component: reg.component, collapsed: entry.collapsed });
        }
    }

    private handleAction(detail: ShellActionDetail): void {
        if (!this.state) return;
        if (detail.action === "toggle-collapse") {
            this.toggleCollapse(detail.id);
            return;
        }
        if (detail.action === "swap") {
            if (findSwapSide(this.state, detail.id)) this.persistAndRender();
            return;
        }
        if (detail.action === "up") {
            if (move(this.state, detail.id, -1)) this.persistAndRender();
            return;
        }
        if (detail.action === "down" && move(this.state, detail.id, 1)) this.persistAndRender();
    }

    private toggleCollapse(id: string): void {
        if (!this.state) return;
        const entry = findEntry(this.state, id);
        if (!entry) return;
        entry.collapsed = !entry.collapsed;
        this.shells.get(id)?.shell.setCollapsed(entry.collapsed);
        this.persist();
    }

    private persistAndRender(): void {
        this.persist();
        this.render();
    }

    private persist(): void {
        if (this.state) this.persistence.save(this.state);
    }
}
