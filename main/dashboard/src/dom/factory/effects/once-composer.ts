import type { EffectDescriptor, EffectTrigger } from "./effect-types.js";

export function onceEffect(name: string, trigger: EffectTrigger = "mount"): EffectDescriptor {
    return { name, trigger, once: true };
}
