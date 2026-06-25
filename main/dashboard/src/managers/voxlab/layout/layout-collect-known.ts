import type { LayoutEntry } from "../../../shared/types/voxlab/layout-types.js";

export function collectMoveKnown(
    entries: LayoutEntry[] | undefined,
    known: Set<string>,
    seen: Set<string>,
): LayoutEntry[] {
    if (!entries) return [];
    const out: LayoutEntry[] = [];
    for (const entry of entries) {
        if (known.has(entry.id) && !seen.has(entry.id)) {
            seen.add(entry.id);
            out.push({ id: entry.id, collapsed: !!entry.collapsed });
        }
    }
    return out;
}
