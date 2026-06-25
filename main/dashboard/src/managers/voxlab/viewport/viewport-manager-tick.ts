import type { Group, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { EffectsManager } from "../effects/effects-manager.js";
import type { MotionManager } from "../timeline/motion-manager.js";
import type { StressShaderManager } from "../effects/stress-shader-manager.js";
import type { LifecycleHandles } from "./viewport-manager-lifecycle.js";

export const FPS_SAMPLE_WINDOW_MS = 500;
const MS_PER_SECOND = 1000;

export interface RenderFrameArgs {
    renderer: WebGLRenderer;
    scene: Scene;
    camera: PerspectiveCamera;
    controls: OrbitControls;
    effects: EffectsManager | null;
    motion: MotionManager | null;
    stress: StressShaderManager | null;
    animatedGroup: Group | null;
}

export function renderOneFrame(args: RenderFrameArgs, nowMs: number): boolean {
    const gl = args.renderer.getContext();
    if (gl.isContextLost()) return false;
    args.controls.update();
    if (args.animatedGroup && args.motion) args.motion.apply(args.animatedGroup, nowMs);
    args.stress?.tick(nowMs);
    if (args.effects) args.effects.render();
    else args.renderer.render(args.scene, args.camera);
    return true;
}

export function hasActiveAnimation(
    animatedGroup: Group | null,
    motion: MotionManager | null,
    stress: StressShaderManager | null,
): boolean {
    if (animatedGroup && motion?.hasActiveAnimation()) return true;
    if (stress?.hasActiveAnimation()) return true;
    return false;
}

export interface FpsCounter {
    count: number;
    sampleStartMs: number;
}

export function newFpsCounter(): FpsCounter {
    return { count: 0, sampleStartMs: 0 };
}

export function maybeEmitFps(counter: FpsCounter, nowMs: number, emit: (fps: number) => void): void {
    counter.count++;
    if (counter.sampleStartMs === 0) counter.sampleStartMs = nowMs;
    const elapsed = nowMs - counter.sampleStartMs;
    if (elapsed >= FPS_SAMPLE_WINDOW_MS) {
        emit((counter.count / elapsed) * MS_PER_SECOND);
        counter.count = 0;
        counter.sampleStartMs = nowMs;
    }
}

export interface TickArgs {
    handles: LifecycleHandles;
    fps: FpsCounter;
    targetFpsRef: { v: number };
    lastFrameMsRef: { v: number };
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    controls: OrbitControls;
    motion: () => MotionManager | null;
    stress: () => StressShaderManager | null;
    animatedGroup: () => Group | null;
    emitFps: (fps: number) => void;
}

function shouldRenderNow(args: TickArgs): boolean {
    return args.handles.needsRender.v || hasActiveAnimation(args.animatedGroup(), args.motion(), args.stress());
}

function buildFrame(args: TickArgs): RenderFrameArgs {
    return {
        renderer: args.renderer,
        scene: args.scene,
        camera: args.camera,
        controls: args.controls,
        effects: null,
        motion: null,
        stress: null,
        animatedGroup: null,
    };
}

function maybeRender(frame: RenderFrameArgs, args: TickArgs, nowMs: number): void {
    if (!shouldRenderNow(args)) return;
    frame.effects = args.handles.effects.v;
    frame.motion = args.motion();
    frame.stress = args.stress();
    frame.animatedGroup = args.animatedGroup();
    if (renderOneFrame(frame, nowMs)) {
        args.handles.needsRender.v = false;
        maybeEmitFps(args.fps, nowMs, args.emitFps);
    }
}

function fpsThrottled(args: TickArgs, nowMs: number): boolean {
    if (args.targetFpsRef.v <= 0) return false;
    const minFrameMs = MS_PER_SECOND / args.targetFpsRef.v;
    if (nowMs - args.lastFrameMsRef.v < minFrameMs) return true;
    args.lastFrameMsRef.v = nowMs;
    return false;
}

export function makeTick(args: TickArgs): (nowMs: number) => void {
    const frame = buildFrame(args);
    const tick = (nowMs: number): void => {
        if (!args.handles.running.v) return;
        if (fpsThrottled(args, nowMs)) {
            args.handles.rafHandle.v = requestAnimationFrame(tick);
            return;
        }
        maybeRender(frame, args, nowMs);
        args.handles.rafHandle.v = requestAnimationFrame(tick);
    };
    return tick;
}
