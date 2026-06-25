import {
    type Camera,
    type PerspectiveCamera,
    RGBAFormat,
    Scene,
    UnsignedByteType,
    WebGLRenderer,
    WebGLRenderTarget,
    type Group,
} from "three";

export interface CaptureState {
    savedBackground: Scene["background"];
    savedAspect: number;
    savedClearAlpha: number;
    savedHelpers: boolean;
    restoreCallbacks: Array<() => void>;
}

export interface CaptureDeps {
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    helperGroup: Group;
    captureHideHooks: ReadonlyArray<() => () => void>;
}

export function setupCaptureState(
    deps: CaptureDeps,
    width: number,
    height: number,
    transparent: boolean,
): CaptureState {
    const saved: CaptureState = {
        savedBackground: deps.scene.background,
        savedAspect: deps.camera.aspect,
        savedClearAlpha: deps.renderer.getClearAlpha(),
        savedHelpers: deps.helperGroup.visible,
        restoreCallbacks: [],
    };
    deps.camera.aspect = width / height;
    deps.camera.updateProjectionMatrix();
    deps.helperGroup.visible = false;
    for (const register of deps.captureHideHooks) saved.restoreCallbacks.push(register());
    if (transparent) {
        deps.scene.background = null;
        deps.renderer.setClearAlpha(0);
    }
    return saved;
}

export function restoreCaptureState(deps: CaptureDeps, saved: CaptureState): void {
    deps.scene.background = saved.savedBackground;
    deps.camera.aspect = saved.savedAspect;
    deps.camera.updateProjectionMatrix();
    deps.renderer.setClearAlpha(saved.savedClearAlpha);
    deps.helperGroup.visible = saved.savedHelpers;
    for (const restore of saved.restoreCallbacks) restore();
}

export interface RenderCaptureArgs {
    renderer: WebGLRenderer;
    scene: Scene;
    camera: Camera;
    target: WebGLRenderTarget | null;
    width: number;
    height: number;
}

export function renderCapture(args: RenderCaptureArgs): { target: WebGLRenderTarget; ref: WebGLRenderTarget } {
    const { renderer, scene, camera, target, width, height } = args;
    let captureTarget = target;
    if (!captureTarget)
        captureTarget = new WebGLRenderTarget(width, height, { format: RGBAFormat, type: UnsignedByteType });
    else if (captureTarget.width !== width || captureTarget.height !== height) captureTarget.setSize(width, height);
    renderer.setRenderTarget(captureTarget);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    return { target: captureTarget, ref: captureTarget };
}

import type { EffectsManager } from "../effects/effects-manager.js";
import type { MotionManager } from "../timeline/motion-manager.js";
import type { StressShaderManager } from "../effects/stress-shader-manager.js";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export interface CaptureRunArgs {
    deps: CaptureDeps;
    controls: OrbitControls;
    effects: EffectsManager | null;
    motion: MotionManager | null;
    stress: StressShaderManager | null;
    animatedGroup: Group | null;
    captureTargetRef: { v: WebGLRenderTarget | null };
}

export interface CapturePixelsArgs {
    run: CaptureRunArgs;
    width: number;
    height: number;
    transparent: boolean;
    motionTimeMs: number | undefined;
}

function renderCaptureSource(args: CapturePixelsArgs["run"], width: number, height: number): WebGLRenderTarget {
    if (args.effects) return args.effects.renderOffscreen(width, height);
    const out = renderCapture({
        renderer: args.deps.renderer,
        scene: args.deps.scene,
        camera: args.deps.camera,
        target: args.captureTargetRef.v,
        width,
        height,
    });
    args.captureTargetRef.v = out.target;
    return out.ref;
}

export function runCapturePixels(opts: CapturePixelsArgs): Uint8Array {
    const { run: args, width, height, transparent, motionTimeMs } = opts;
    const pixels = new Uint8Array(width * height * 4);
    const saved = setupCaptureState(args.deps, width, height, transparent);
    try {
        const t = motionTimeMs ?? performance.now();
        args.controls.update();
        if (args.animatedGroup && args.motion) args.motion.apply(args.animatedGroup, t);
        args.stress?.tick(t);
        const source = renderCaptureSource(args, width, height);
        args.deps.renderer.readRenderTargetPixels(source, 0, 0, width, height, pixels);
    } finally {
        restoreCaptureState(args.deps, saved);
    }
    return pixels;
}
