import { swapAttr } from "./clone-attr-swap.js";
import { applyToSubtree } from "./clone-walk.js";
import { unhideRoot } from "./clone-unhide.js";

const KEY_ATTR = "data-key";
const CLONED_KEY_ATTR = "data-ai-clone";
const ID_ATTR = "id";
const CLONED_ID_ATTR = "data-ai-cloned-id";

export const CLONE_KEY_ATTR = KEY_ATTR;

export function prepareClone(clone: HTMLElement, original: HTMLElement): void {
    unhideRoot(clone, original);
    applyToSubtree(clone, `[${KEY_ATTR}]`, (el) => swapAttr(el, KEY_ATTR, CLONED_KEY_ATTR));
    applyToSubtree(clone, `[${ID_ATTR}]`, (el) => swapAttr(el, ID_ATTR, CLONED_ID_ATTR));
}
