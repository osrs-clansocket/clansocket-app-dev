import { applyOne } from "./effect-applier.js";

export function flashInvalid(el: HTMLElement): void {
    applyOne(el, { name: "flash-attention", once: true });
}
