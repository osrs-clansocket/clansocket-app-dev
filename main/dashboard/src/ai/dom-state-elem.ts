import type { ElementState } from "./dom-state-types.js";
import { extractHref } from "./dom-state-href.js";

const ATTR_ARIA_LABEL = "aria-label";
const TARGET_ARIA_LABEL = "ariaLabel";
const ROLE = "role";
const TYPE = "type";
const NAME = "name";
const FLAG = true;

function setIfPresent(state: ElementState, el: HTMLElement, attr: string, target: keyof ElementState): void {
    const v = el.getAttribute(attr);
    if (v && v.length > 0) (state as unknown as Record<string, unknown>)[target] = v;
}

export function applyElementAttrs(state: ElementState, el: HTMLElement): void {
    setIfPresent(state, el, ATTR_ARIA_LABEL, TARGET_ARIA_LABEL);
    setIfPresent(state, el, ROLE, ROLE);
    setIfPresent(state, el, TYPE, TYPE);
    setIfPresent(state, el, NAME, NAME);
    if (el.hidden) state.hidden = FLAG;
    const href = extractHref(el);
    if (href) state.href = href;
}

export function applyDatasetAttrs(state: ElementState, el: HTMLElement): void {
    if (el.dataset.context) state.context = el.dataset.context;
    if (el.dataset.meta) state.meta = el.dataset.meta;
}
