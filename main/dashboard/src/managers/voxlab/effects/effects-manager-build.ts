import { Vector2, type Object3D } from "three";
import type { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import type { EffectsSettings } from "../../../shared/types/voxlab/effects-types.js";
import type { ComposerPasses } from "./effects-manager-types.js";
import { type BuildDeps } from "./effects-build-composer.js";
import { addOutlineBloom, addShaderPasses } from "./effects-shader-passes.js";

export type { BuildDeps } from "./effects-build-composer.js";
export { buildOnscreenComposer, buildOffscreenComposer } from "./effects-build-composer.js";

export interface OnscreenPassesArgs {
    composer: EffectComposer;
    settings: EffectsSettings;
    deps: BuildDeps;
    width: number;
    height: number;
    selectedObjects: Object3D[];
}

export function addOnscreenPasses(args: OnscreenPassesArgs): Omit<ComposerPasses, "composer"> {
    const { composer, settings, deps, width, height, selectedObjects } = args;
    const out: Omit<ComposerPasses, "composer"> = {};
    const initPr = deps.renderer.getPixelRatio();
    const screenSize = new Vector2(width * initPr, height * initPr);
    addOutlineBloom({ composer, out, screenSize, settings, deps, selectedObjects });
    addShaderPasses(composer, out, settings);
    composer.addPass(new OutputPass());
    return out;
}

export function addOffscreenPasses(
    composer: EffectComposer,
    settings: EffectsSettings,
    deps: BuildDeps,
    selectedObjects: Object3D[],
): Omit<ComposerPasses, "composer"> {
    const out: Omit<ComposerPasses, "composer"> = {};
    addOutlineBloom({ screenSize: new Vector2(1, 1), composer, out, settings, deps, selectedObjects });
    addShaderPasses(composer, out, settings);
    const output = new OutputPass();
    output.renderToScreen = false;
    composer.addPass(output);
    return out;
}
