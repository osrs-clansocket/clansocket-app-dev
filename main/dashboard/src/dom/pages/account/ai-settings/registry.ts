import type { Instance } from "../../../factory";

export type TabMounter = (host: Instance) => void;

export interface TabDef {
    key: string;
    label: string;
    mount: TabMounter;
    order?: number;
}

const defs: TabDef[] = [];

export function defineTab(def: TabDef): void {
    defs.push(def);
}

export function tabDefs(): readonly TabDef[] {
    return [...defs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
