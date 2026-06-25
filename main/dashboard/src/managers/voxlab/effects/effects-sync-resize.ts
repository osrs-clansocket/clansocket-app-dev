import type { ComposerPasses } from "./effects-manager-types.js";

export function resizeFxaa(passes: ComposerPasses, width: number, height: number, pr: number): void {
    if (!passes.fxaa) return;
    passes.fxaa.material.uniforms.resolution.value.set(1 / (width * pr), 1 / (height * pr));
}
