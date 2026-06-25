import type { PerspectiveCamera } from "three";

export function setFar(camera: PerspectiveCamera, far: number): void {
    if (Number.isFinite(far) && far > camera.near) {
        camera.far = far;
        camera.updateProjectionMatrix();
    }
}
