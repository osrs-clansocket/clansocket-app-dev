import type { EffectDescriptor, EffectProp } from "./effect-types.js";

export function toDescriptor(prop: EffectProp): EffectDescriptor {
    if (typeof prop === "string") return { name: prop };
    return prop;
}
