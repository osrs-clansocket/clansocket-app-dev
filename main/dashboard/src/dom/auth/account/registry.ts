import type { Instance } from "../../factory";

export interface AccountPanelDef {
    key: string;
    build: () => Instance;
    order?: number;
}

const defs: AccountPanelDef[] = [];

export function defineAccountPanel(def: AccountPanelDef): void {
    defs.push(def);
}

export function accountPanelDefs(): readonly AccountPanelDef[] {
    return [...defs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
