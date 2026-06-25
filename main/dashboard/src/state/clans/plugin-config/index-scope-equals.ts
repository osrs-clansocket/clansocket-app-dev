import type { Scope } from "../../../shared/constants/plugin-config/scope-constants.js";

export function scopeEquals(a: Scope, b: Scope): boolean {
    if (a.kind !== b.kind) return false;
    if (a.kind === "global") return true;
    const aSet = a.set as ReadonlySet<string>;
    const bSet = (b as { set: ReadonlySet<string> }).set;
    if (aSet.size !== bSet.size) return false;
    for (const h of aSet) if (!bSet.has(h)) return false;
    return true;
}
