import type { Group, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import type { GridAxesOverlay } from "./grid-axes-overlay.js";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { CursorService } from "../services/cursor-service.js";
import type { EffectsManager } from "../effects/effects-manager.js";
import type { MotionManager } from "../timeline/motion-manager.js";
import type { StressShaderManager } from "../effects/stress-shader-manager.js";
import { runCapturePixels, type CaptureDeps } from "./viewport-manager-capture.js";
import { startViewport, stopViewport, type LifecycleHandles } from "./viewport-manager-lifecycle.js";
import { ViewportCameraMixin } from "./viewport-camera-mixin.js";

export abstract class ViewportLifecycleMixin extends ViewportCameraMixin {
    abstract readonly scene: Scene;
    abstract readonly stage: HTMLElement;
    protected abstract readonly canvas: HTMLCanvasElement;
    protected abstract readonly cursor: CursorService;
    protected abstract readonly contextRecovery: {
        addEventListener: (type: string, listener: () => void) => void;
        dispose?: () => void;
    };
    protected abstract readonly captureHideHooks: Array<() => () => void>;
    protected abstract motion: MotionManager | null;
    protected abstract stress: StressShaderManager | null;
    protected abstract readonly helpers: GridAxesOverlay;
    protected abstract readonly rebuildHandler: () => void;
    protected abstract animatedGroup: Group | null;
    protected abstract tick: (nowMs: number) => void;
    protected abstract resize(): void;

    markDirty(): void {
        this.handles.needsRender.v = true;
    }
    useEffects(effects: EffectsManager): void {
        this.handles.effects.v = effects;
    }
    useMotion(motion: MotionManager): void {
        this.motion = motion;
    }
    useStress(stress: StressShaderManager): void {
        this.stress = stress;
    }
    setAnimatedGroup(group: Group | null): void {
        this.animatedGroup = group;
    }
    addHideHook(register: () => () => void): void {
        this.captureHideHooks.push(register);
    }
    get supersample(): number {
        return this.handles.effects.v?.getSupersample() ?? 1;
    }

    start(): void {
        startViewport({
            cursor: this.cursor,
            contextRecovery: this.contextRecovery as Parameters<typeof startViewport>[0]["contextRecovery"],
            stage: this.stage,
            canvas: this.canvas,
            resize: () => this.resize(),
            resetCamera: () => this.resetCamera(null),
            tick: this.tick,
            handles: this.handles,
        });
    }
    stop(): void {
        stopViewport({
            cursor: this.cursor,
            contextRecovery: this.contextRecovery as Parameters<typeof stopViewport>[0]["contextRecovery"],
            controls: this.controls,
            renderer: this.renderer,
            scene: this.scene,
            helpers: this.helpers,
            rebuildHandler: this.rebuildHandler,
            handles: this.handles,
        });
    }
    pauseTick(): void {
        this.handles.running.v = false;
        if (this.handles.rafHandle.v) {
            cancelAnimationFrame(this.handles.rafHandle.v);
            this.handles.rafHandle.v = 0;
        }
        this.cursor.pause();
    }
    resumeTick(): void {
        if (this.handles.running.v) return;
        this.cursor.resume();
        this.handles.running.v = true;
        this.handles.needsRender.v = true;
        this.tick(performance.now());
    }

    captureFramePixels(width: number, height: number, transparent: boolean, motionTimeMs?: number): Uint8Array {
        const deps: CaptureDeps = {
            scene: this.scene,
            camera: this.camera as PerspectiveCamera,
            renderer: this.renderer as WebGLRenderer,
            helperGroup: this.helpers.group,
            captureHideHooks: this.captureHideHooks,
        };
        return runCapturePixels({
            run: {
                deps,
                controls: this.controls as OrbitControls,
                effects: this.handles.effects.v,
                motion: this.motion,
                stress: this.stress,
                animatedGroup: this.animatedGroup,
                captureTargetRef: this.handles.captureTarget,
            },
            width,
            height,
            transparent,
            motionTimeMs,
        });
    }

    protected abstract readonly handles: LifecycleHandles;
}
