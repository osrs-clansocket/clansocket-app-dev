import type { Object3D } from "three";
import type { EffectsSettings } from "../../../shared/types/voxlab/effects-types.js";
import type { ComposerPasses } from "./effects-manager-types.js";
import {
    addOffscreenPasses,
    addOnscreenPasses,
    buildOffscreenComposer,
    buildOnscreenComposer,
    type BuildDeps,
} from "./effects-manager-build.js";
import { resizeFxaa } from "./effects-sync-resize.js";
import { syncPasses } from "./effects-sync-passes.js";

export { resizeFxaa } from "./effects-sync-resize.js";
export { syncPasses } from "./effects-sync-passes.js";

export interface BuildOnscreenArgs {
    deps: BuildDeps;
    settings: EffectsSettings;
    width: number;
    height: number;
    samples: number;
    selectedObjects: Object3D[];
}

export function buildOnscreen(args: BuildOnscreenArgs): ComposerPasses {
    const { deps, settings, width, height, samples, selectedObjects } = args;
    const composer = buildOnscreenComposer(deps, width, height, samples);
    const passes = addOnscreenPasses({ composer, settings, deps, width, height, selectedObjects });
    composer.setSize(width, height);
    const result: ComposerPasses = { composer, ...passes };
    resizeFxaa(result, width, height, deps.renderer.getPixelRatio());
    return result;
}

export function buildOffscreen(
    deps: BuildDeps,
    settings: EffectsSettings,
    samples: number,
    selectedObjects: Object3D[],
): ComposerPasses {
    const composer = buildOffscreenComposer(deps, samples);
    const passes = addOffscreenPasses(composer, settings, deps, selectedObjects);
    const out: ComposerPasses = { composer, ...passes };
    syncPasses(out, settings);
    return out;
}
