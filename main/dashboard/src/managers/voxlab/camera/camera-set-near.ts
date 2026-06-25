import type { PerspectiveCamera } from "three";

export function setNear(camera: PerspectiveCamera, near: number): void {
    if (Number.isFinite(near) && near > 0) {
        camera.near = near;
        camera.updateProjectionMatrix();
    }
}
