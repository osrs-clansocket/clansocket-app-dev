import type { Box3, Mesh, PerspectiveCamera } from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
    applyCameraExact,
    frameFov,
    frontMeshView,
    panCamera,
    resetCameraTo,
    setDampingFactor,
    setFar,
    setFov,
    setNear,
} from "./viewport-manager-camera.js";
import type { LifecycleHandles } from "./viewport-manager-lifecycle.js";
import { ViewportRenderMixin } from "./viewport-render-mixin.js";

export abstract class ViewportCameraMixin extends ViewportRenderMixin {
    abstract readonly camera: PerspectiveCamera;
    abstract readonly controls: OrbitControls;
    protected abstract readonly handles: LifecycleHandles;
    protected abstract frameAspect: number;

    setFov(fov: number): void {
        setFov(this.camera, fov);
    }
    setNear(near: number): void {
        setNear(this.camera, near);
    }
    setFar(far: number): void {
        setFar(this.camera, far);
    }
    setDampingFactor(factor: number): void {
        setDampingFactor(this.controls, factor);
    }
    setCameraPosition(x: number, y: number, z: number): void {
        this.camera.position.set(x, y, z);
        this.controls.update();
    }
    setCameraTarget(x: number, y: number, z: number): void {
        this.controls.target.set(x, y, z);
        this.controls.update();
    }
    panCamera(dx: number): void {
        panCamera(this.camera, this.controls, dx);
        this.handles.needsRender.v = true;
    }

    setFrameAspect(aspect: number): void {
        if (!Number.isFinite(aspect) || aspect <= 0) return;
        this.frameAspect = aspect;
        this.dispatchEvent(new CustomEvent("frame-aspect-change"));
    }
    get currentFrameAspect(): number {
        return this.frameAspect;
    }
    frameFov(): number {
        return frameFov(this.camera, this.frameAspect);
    }

    resetCamera(boundingBox: Box3 | null, fitMultiplier?: number): void {
        resetCameraTo({
            camera: this.camera,
            controls: this.controls,
            frameAspect: this.frameAspect,
            boundingBox,
            fitMultiplier,
        });
        this.handles.needsRender.v = true;
    }
    applyCameraExact(cam: Parameters<typeof applyCameraExact>[2]): void {
        applyCameraExact(this.camera, this.controls, cam);
    }
    frontView(mesh: Mesh, frontMultiplier?: number): void {
        frontMeshView(this.camera, this.controls, mesh, frontMultiplier);
        this.handles.needsRender.v = true;
    }
}
