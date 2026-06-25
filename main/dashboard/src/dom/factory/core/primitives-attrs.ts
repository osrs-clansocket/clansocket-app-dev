import type { AttrEntry } from "./types.js";

export function buildAttrs(entries: readonly AttrEntry[]): Record<string, string> {
    const attrs: Record<string, string> = {};
    for (const [k, v] of entries) if (v !== undefined) attrs[k] = v;
    return attrs;
}
