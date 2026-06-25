import type { EffectDescriptor } from "./effect-types.js";

const DEFAULT_STAGGER_BASE_MS = 60;

export function staggerDelay(index: number, baseMs: number = DEFAULT_STAGGER_BASE_MS): number {
    return Math.max(0, index) * baseMs;
}

export function staggerEffect(index: number, name: string, baseMs: number = DEFAULT_STAGGER_BASE_MS): EffectDescriptor {
    return { name, trigger: "intersect", delay: staggerDelay(index, baseMs), once: true };
}
