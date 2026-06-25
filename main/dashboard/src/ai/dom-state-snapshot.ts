import type { ElementState } from "./dom-state-types.js";
import { extractText } from "./dom-state-text.js";
import { applyDatasetAttrs, applyElementAttrs } from "./dom-state-elem.js";
import { applyInputAttrs } from "./dom-state-input.js";

const FLAG = true;

export function snapshot(el: HTMLElement): ElementState {
    const rect = el.getBoundingClientRect();
    const state: ElementState = {
        tag: el.tagName.toLowerCase(),
        classes: el.className,
        text: extractText(el),
        visible: rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight && !el.hidden,
    };
    applyElementAttrs(state, el);
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
        applyInputAttrs(state, el);
    }
    if (el instanceof HTMLButtonElement && el.disabled) state.disabled = FLAG;
    applyDatasetAttrs(state, el);
    return state;
}
