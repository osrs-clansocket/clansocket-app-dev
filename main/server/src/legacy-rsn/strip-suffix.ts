import { NAME_CHANGED_SUFFIX } from "../database/plugin/saturated-tables.js";

export function stripSuffix(rsn: string): string {
    const idx = rsn.indexOf(NAME_CHANGED_SUFFIX);
    return idx > 0 ? rsn.slice(0, idx) : rsn;
}
