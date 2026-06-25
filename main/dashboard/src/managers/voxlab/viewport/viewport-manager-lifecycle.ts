import type { CursorService } from "../services/cursor-service.js";
import type { ContextRecoveryService } from "../services/context-recovery-service.js";
import type { EffectsManager } from "../effects/effects-manager.js";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Scene, WebGLRenderer, WebGLRenderTarget } from "three";
import type { GridAxesOverlay } from "./grid-axes-overlay.js";

export interface LifecycleHandles {
    rafHandle: { v: number };
    running: { v: boolean };
    needsRender: { v: boolean };
    resizeObserver: { v: ResizeObserver | null };
    captureTarget: { v: WebGLRenderTarget | null };
    effects: { v: EffectsManager | null };
}

export interface StartArgs {
    cursor: CursorService;
    contextRecovery: ContextRecoveryService;
    stage: HTMLElement;
    canvas: HTMLCanvasElement;
    resize: () => void;
    resetCamera: () => void;
    tick: (nowMs: number) => void;
    handles: LifecycleHandles;
}

export function startViewport(args: StartArgs): void {
    args.cursor.start(args.stage);
    args.contextRecovery.start(args.canvas);
    let resizeScheduled = false;
    args.handles.resizeObserver.v = new ResizeObserver(() => {
        if (resizeScheduled) return;
        resizeScheduled = true;
        requestAnimationFrame(() => {
            resizeScheduled = false;
            args.resize();
        });
    });
    args.handles.resizeObserver.v.observe(args.stage);
    args.resize();
    args.resetCamera();
    args.handles.running.v = true;
    args.handles.needsRender.v = true;
    args.tick(performance.now());
}

export interface StopArgs {
    cursor: CursorService;
    contextRecovery: ContextRecoveryService;
    controls: OrbitControls;
    renderer: WebGLRenderer;
    scene: Scene;
    helpers: GridAxesOverlay;
    rebuildHandler: () => void;
    handles: LifecycleHandles;
}

export function stopViewport(args: StopArgs): void {
    args.handles.running.v = false;
    if (args.handles.rafHandle.v) {
        cancelAnimationFrame(args.handles.rafHandle.v);
        args.handles.rafHandle.v = 0;
    }
    args.cursor.stop();
    args.contextRecovery.removeEventListener("rebuild-requested", args.rebuildHandler);
    args.contextRecovery.stop();
    args.handles.resizeObserver.v?.disconnect();
    args.handles.resizeObserver.v = null;
    args.handles.effects.v?.dispose();
    args.handles.effects.v = null;
    if (args.handles.captureTarget.v) {
        args.handles.captureTarget.v.dispose();
        args.handles.captureTarget.v = null;
    }
    // eslint-disable-next-line lvi/no-raw-dom -- three.js Scene.remove, not DOM
    args.scene.remove(args.helpers.group);
    args.helpers.dispose();
    args.controls.dispose();
    args.renderer.dispose();
}
