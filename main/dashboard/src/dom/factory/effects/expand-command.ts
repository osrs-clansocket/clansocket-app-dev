import { applyOne } from "./effect-applier.js";

export function expandWithFade(el: HTMLElement, open: boolean): void {
    if (open) {
        el.hidden = false;
        applyOne(el, { name: "fade-in", once: true });
        return;
    }
    el.hidden = true;
}
