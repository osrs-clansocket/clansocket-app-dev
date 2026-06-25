import { effectClass } from "./class-formatter.js";

export function addEffectClass(el: HTMLElement, name: string): void {
    el.classList.add(effectClass(name));
}

export function removeEffectClass(el: HTMLElement, name: string): void {
    el.classList.remove(effectClass(name));
}
