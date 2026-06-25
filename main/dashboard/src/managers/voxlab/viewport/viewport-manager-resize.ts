import type { PerspectiveCamera, WebGLRenderer } from "three";
import type { EffectsManager } from "../effects/effects-manager.js";

const DPR_EPSILON = 1e-3;

export interface ResizeArgs {
    stage: HTMLElement;
    renderer: WebGLRenderer;
    camera: PerspectiveCamera;
    effects: EffectsManager | null;
    currentDprRef: { v: number };
    emitAspect: () => void;
}

export function performResize(args: ResizeArgs): boolean {
    const w = args.stage.clientWidth;
    const h = args.stage.clientHeight;
    if (w === 0 || h === 0) return false;
    const dpr = window.devicePixelRatio || 1;
    if (Math.abs(dpr - args.currentDprRef.v) > DPR_EPSILON) {
        args.currentDprRef.v = dpr;
        args.renderer.setPixelRatio(dpr);
    }
    const newAspect = w / h;
    const aspectChanged = Math.abs(newAspect - args.camera.aspect) > 0.001;
    args.camera.aspect = newAspect;
    args.camera.updateProjectionMatrix();
    args.renderer.setSize(w, h, false);
    args.effects?.resize(w, h);
    if (aspectChanged) args.emitAspect();
    return true;
}
