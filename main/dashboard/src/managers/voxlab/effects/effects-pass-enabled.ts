import type { EffectsSettings } from "../../../shared/types/voxlab/effects-types.js";

export interface PassEnabledSet {
    outline: boolean;
    bloom: boolean;
    vignette: boolean;
    chroma: boolean;
    contrast: boolean;
    fxaa: boolean;
}

export const PASS_KEYS: readonly (keyof PassEnabledSet)[] = [
    "outline",
    "bloom",
    "vignette",
    "chroma",
    "contrast",
    "fxaa",
];

export function enabledSet(s: EffectsSettings): PassEnabledSet {
    return {
        outline: s.outlineEnabled,
        bloom: s.bloomEnabled,
        vignette: s.vignetteEnabled,
        chroma: s.chromaticAberrationEnabled,
        contrast: s.contrastEnabled,
        fxaa: s.fxaaEnabled,
    };
}

export function passSetsEqual(a: PassEnabledSet, b: PassEnabledSet): boolean {
    for (const k of PASS_KEYS) if (a[k] !== b[k]) return false;
    return true;
}
