import type { Instance as _Instance } from "../../../factory";
type TabBuilderReturn = HTMLElement | _Instance<HTMLElement>["el"];

export type ManageTabBuilder = (slug: string, subTab?: string | null) => TabBuilderReturn;

export interface ManageTabDef {
    key: string;
    build: ManageTabBuilder;
    order?: number;
}

const defs: ManageTabDef[] = [];

export function defineManageTab(def: ManageTabDef): void {
    defs.push(def);
}

export function manageTabDefs(): readonly ManageTabDef[] {
    return [...defs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
