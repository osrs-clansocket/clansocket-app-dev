import type { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import type { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import type { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import type { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export interface ComposerPasses {
    composer: EffectComposer;
    outline?: OutlinePass;
    bloom?: UnrealBloomPass;
    vignette?: ShaderPass;
    chroma?: ShaderPass;
    contrast?: ShaderPass;
    fxaa?: ShaderPass;
}

export type OnscreenPasses = ComposerPasses;
export type OffscreenPasses = ComposerPasses;
