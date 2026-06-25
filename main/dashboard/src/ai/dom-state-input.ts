import type { ElementState } from "./dom-state-types.js";

const FLAG = true;

export function applyInputAttrs(
    state: ElementState,
    el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
): void {
    if (el.value) state.value = el.value;
    if ((el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) && el.placeholder) {
        state.placeholder = el.placeholder;
    }
    if (el.disabled) state.disabled = FLAG;
    if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio") && el.checked) {
        state.checked = FLAG;
    }
}
