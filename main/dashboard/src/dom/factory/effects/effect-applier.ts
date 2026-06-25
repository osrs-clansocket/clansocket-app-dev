import type { EffectDescriptor, EffectProp } from "./effect-types.js";
import { toDescriptor } from "./descriptor-normalizer.js";
import { effectClass } from "./class-formatter.js";

function attachOnce(el: HTMLElement, cls: string): void {
    const handler = (): void => {
        el.classList.remove(cls);
        el.removeEventListener("animationend", handler);
    };
    el.addEventListener("animationend", handler);
}

export function applyOne(el: HTMLElement, d: EffectDescriptor): void {
    const cls = effectClass(d.name);
    const trigger = d.trigger ?? "mount";
    const fire = (): void => {
        el.classList.add(cls);
        if (d.once === true) attachOnce(el, cls);
    };
    if (trigger === "intersect") {
        const observer = new IntersectionObserver((entries, obs) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                if (d.delay !== undefined && d.delay > 0) window.setTimeout(fire, d.delay);
                else fire();
                obs.disconnect();
            }
        });
        observer.observe(el);
        return;
    }
    if (d.delay !== undefined && d.delay > 0) {
        window.setTimeout(fire, d.delay);
        return;
    }
    fire();
}

export function applyEffects(el: HTMLElement, prop: EffectProp | readonly EffectProp[] | undefined): void {
    if (prop === undefined) return;
    if (Array.isArray(prop)) {
        for (const p of prop) applyOne(el, toDescriptor(p));
        return;
    }
    applyOne(el, toDescriptor(prop as EffectProp));
}
