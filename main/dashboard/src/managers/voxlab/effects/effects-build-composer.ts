import {
    SRGBColorSpace,
    UnsignedByteType,
    WebGLRenderTarget,
    type Camera,
    type Scene,
    type WebGLRenderer,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";

export interface BuildDeps {
    renderer: WebGLRenderer;
    scene: Scene;
    camera: Camera;
}

export function buildOnscreenComposer(deps: BuildDeps, width: number, height: number, samples: number): EffectComposer {
    const target = new WebGLRenderTarget(width, height, { type: UnsignedByteType, samples });
    target.texture.colorSpace = SRGBColorSpace;
    const composer = new EffectComposer(deps.renderer, target);
    composer.setPixelRatio(deps.renderer.getPixelRatio());
    composer.addPass(new RenderPass(deps.scene, deps.camera));
    return composer;
}

export function buildOffscreenComposer(deps: BuildDeps, samples: number): EffectComposer {
    const target = new WebGLRenderTarget(1, 1, { type: UnsignedByteType, samples });
    target.texture.colorSpace = SRGBColorSpace;
    const composer = new EffectComposer(deps.renderer, target);
    composer.setPixelRatio(1);
    composer.addPass(new RenderPass(deps.scene, deps.camera));
    return composer;
}
