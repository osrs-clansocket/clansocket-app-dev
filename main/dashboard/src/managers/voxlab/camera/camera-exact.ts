import type { PerspectiveCamera } from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface ExactCamera {
    fov: number;
    near: number;
    far: number;
    dampingFactor: number;
    positionX: number;
    positionY: number;
    positionZ: number;
    targetX: number;
    targetY: number;
    targetZ: number;
}

function applyExactLens(camera: PerspectiveCamera, cam: ExactCamera): void {
    camera.fov = cam.fov;
    camera.near = cam.near;
    camera.far = cam.far;
    camera.updateProjectionMatrix();
    camera.position.set(cam.positionX, cam.positionY, cam.positionZ);
}

export function applyCameraExact(camera: PerspectiveCamera, controls: OrbitControls, cam: ExactCamera): void {
    const wasDamping = controls.enableDamping;
    controls.enableDamping = false;
    applyExactLens(camera, cam);
    controls.target.set(cam.targetX, cam.targetY, cam.targetZ);
    controls.update();
    controls.saveState();
    controls.dampingFactor = cam.dampingFactor;
    controls.enableDamping = wasDamping;
}
