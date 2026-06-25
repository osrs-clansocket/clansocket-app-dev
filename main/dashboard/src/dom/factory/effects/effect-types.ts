export type EffectTrigger = "mount" | "intersect";

export interface EffectDescriptor {
    name: string;
    trigger?: EffectTrigger;
    delay?: number;
    once?: boolean;
}

export type EffectProp = string | EffectDescriptor;
