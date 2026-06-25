import { DEDUP_SEP } from "./actions/action-types.js";
import type { ElementState } from "./dom-state-types.js";
import { snapshot } from "./dom-state-snapshot.js";

const ATTR_DATA_KEY = "data-key";

function collectDomState(): Record<string, ElementState> {
    const state: Record<string, ElementState> = {};
    const seen = new Map<string, number>();
    for (const el of document.querySelectorAll<HTMLElement>(`[${ATTR_DATA_KEY}]`)) {
        const base = el.dataset.key;
        if (!base) continue;
        const n = (seen.get(base) ?? 0) + 1;
        seen.set(base, n);
        state[n === 1 ? base : `${base}${DEDUP_SEP}${n}`] = snapshot(el);
    }
    return state;
}

export { collectDomState };
export type { ElementState };
