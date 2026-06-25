import { DEDUP_SEP } from "../../../ai/actions/action-types.js";
import { isDataKey } from "./clone-key-validate.js";
import { missingRef } from "./clone-placeholder.js";
import { CLONE_KEY_ATTR, prepareClone } from "./clone-subtree.js";

export { isDataKey } from "./clone-key-validate.js";
export { missingRef, visitPagePlaceholder } from "./clone-placeholder.js";

const NOT_FOUND = -1;
const DEFAULT_INDEX = 1;

function parseKey(key: string): { base: string; index: number } {
    const hashIdx = key.indexOf(DEDUP_SEP);
    if (hashIdx === NOT_FOUND) return { base: key, index: DEFAULT_INDEX };
    const base = key.slice(0, hashIdx);
    const n = Number(key.slice(hashIdx + 1));
    return { base, index: Number.isFinite(n) && n > 0 ? n : DEFAULT_INDEX };
}

export function tryClone(key: string): string | null {
    if (!isDataKey(key)) return null;
    const { base, index } = parseKey(key);
    const matches = document.querySelectorAll<HTMLElement>(`[${CLONE_KEY_ATTR}="${base}"]`);
    const el = matches[index - 1];
    if (el === undefined) return null;
    const clone = el.cloneNode(true) as HTMLElement;
    prepareClone(clone, el);
    return clone.outerHTML;
}

export function cloneByKey(key: string): string {
    return tryClone(key) ?? missingRef(key);
}
