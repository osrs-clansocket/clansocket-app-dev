import { Vector2, type Object3D } from "three";
import type { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { CHROMATIC_ABERRATION_SHADER } from "../../../shared/constants/voxlab/shaders/aberration-shader.js";
import { CONTRAST_SHADER } from "../../../shared/constants/voxlab/shaders/contrast-shader-constants.js";
import { VIGNETTE_SHADER } from "../../../shared/constants/voxlab/shaders/vignette-shader-constants.js";
import type { EffectsSettings } from "../../../shared/types/voxlab/effects-types.js";
import type { ComposerPasses } from "./effects-manager-types.js";
import type { BuildDeps } from "./effects-build-composer.js";

export interface OutlineBloomArgs {
    composer: EffectComposer;
    out: Omit<ComposerPasses, "composer">;
    screenSize: Vector2;
    settings: EffectsSettings;
    deps: BuildDeps;
    selectedObjects: Object3D[];
}

export function addOutlineBloom(args: OutlineBloomArgs): void {
    const { composer, out, screenSize, settings, deps, selectedObjects } = args;
    if (settings.outlineEnabled) {
        out.outline = new OutlinePass(screenSize.clone(), deps.scene, deps.camera);
        out.outline.selectedObjects = selectedObjects;
        composer.addPass(out.outline);
    }
    if (settings.bloomEnabled) {
        out.bloom = new UnrealBloomPass(
            screenSize.clone(),
            settings.bloomStrength,
            settings.bloomRadius,
            settings.bloomThreshold,
        );
        composer.addPass(out.bloom);
    }
}

export function addShaderPasses(
    composer: EffectComposer,
    out: Omit<ComposerPasses, "composer">,
    settings: EffectsSettings,
): void {
    if (settings.vignetteEnabled) {
        out.vignette = new ShaderPass(VIGNETTE_SHADER);
        composer.addPass(out.vignette);
    }
    if (settings.chromaticAberrationEnabled) {
        out.chroma = new ShaderPass(CHROMATIC_ABERRATION_SHADER);
        composer.addPass(out.chroma);
    }
    if (settings.contrastEnabled) {
        out.contrast = new ShaderPass(CONTRAST_SHADER);
        composer.addPass(out.contrast);
    }
    if (settings.fxaaEnabled) {
        out.fxaa = new ShaderPass(FXAAShader);
        composer.addPass(out.fxaa);
    }
}
