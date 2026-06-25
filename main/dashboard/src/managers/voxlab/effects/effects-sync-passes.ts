import type { Color } from "three";
import type { EffectsSettings } from "../../../shared/types/voxlab/effects-types.js";
import type { ComposerPasses } from "./effects-manager-types.js";

export function syncPasses(passes: ComposerPasses, settings: EffectsSettings): void {
    if (passes.bloom) {
        passes.bloom.strength = settings.bloomStrength;
        passes.bloom.radius = settings.bloomRadius;
        passes.bloom.threshold = settings.bloomThreshold;
    }
    if (passes.outline) {
        passes.outline.edgeStrength = settings.outlineThickness;
        passes.outline.visibleEdgeColor.set(settings.outlineColor);
    }
    if (passes.vignette) {
        passes.vignette.uniforms.amount.value = settings.vignetteAmount;
        (passes.vignette.uniforms.color.value as Color).set(settings.vignetteColor);
    }
    if (passes.chroma) passes.chroma.uniforms.amount.value = settings.chromaticAberrationAmount;
    if (passes.contrast) passes.contrast.uniforms.amount.value = settings.contrastAmount;
}
