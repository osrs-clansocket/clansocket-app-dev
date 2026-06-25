import type { PerspectiveCamera } from "three";

export function setFov(camera: PerspectiveCamera, fov: number): void {
    camera.fov = fov;
    camera.updateProjectionMatrix();
}
