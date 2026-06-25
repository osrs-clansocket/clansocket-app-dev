import { PCFSoftShadowMap, type WebGLRenderer } from "three";
import type { ColorSpaceMode } from "../../../shared/constants/voxlab/effect-constants.js";
import { pickColorSpace } from "./viewport-manager-camera.js";
import { ViewportGridMixin } from "./viewport-grid-mixin.js";

export abstract class ViewportRenderMixin extends ViewportGridMixin {
    abstract readonly renderer: WebGLRenderer;
    protected abstract readonly targetFpsRef: { v: number };
    protected abstract resize(): void;

    setShadowsEnabled(enabled: boolean): void {
        this.renderer.shadowMap.enabled = enabled;
        this.renderer.shadowMap.type = PCFSoftShadowMap;
        this.renderer.shadowMap.needsUpdate = true;
    }
    setAutoShadow(enabled: boolean): void {
        this.renderer.shadowMap.autoUpdate = enabled;
        if (enabled) this.renderer.shadowMap.needsUpdate = true;
    }
    setPixelRatio(ratio: number): void {
        if (Number.isFinite(ratio) && ratio > 0) {
            this.renderer.setPixelRatio(ratio);
            this.resize();
        }
    }
    setTargetFps(fps: number): void {
        this.targetFpsRef.v = !Number.isFinite(fps) || fps < 0 ? 0 : fps;
    }
    setColorSpace(mode: ColorSpaceMode): void {
        this.renderer.outputColorSpace = pickColorSpace(mode);
    }
}
