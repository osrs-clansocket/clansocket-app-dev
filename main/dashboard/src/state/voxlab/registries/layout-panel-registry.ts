import type { BaseVoxlabComponent } from "../../../managers/voxlab/base/base-voxlab-component.js";

export type FooterAccessor<T extends BaseVoxlabComponent = BaseVoxlabComponent> = (footer: FooterShape) => T;

export type FooterShape = Record<string, BaseVoxlabComponent>;

export type LayoutSide = "left" | "right";

export interface PanelDef {
    id: string;
    title: string;
    defaultSide: LayoutSide;
    accessor: FooterAccessor;
    order?: number;
}

const defs: PanelDef[] = [];

export function definePanel(def: PanelDef): void {
    defs.push(def);
}

export function panelDefs(): readonly PanelDef[] {
    return [...defs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
