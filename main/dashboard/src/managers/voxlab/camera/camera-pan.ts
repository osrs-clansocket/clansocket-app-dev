import { Vector3, type PerspectiveCamera } from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const panForward = new Vector3();
const panRight = new Vector3();

export function panCamera(camera: PerspectiveCamera, controls: OrbitControls, dx: number): void {
    camera.getWorldDirection(panForward);
    panRight.crossVectors(panForward, camera.up).normalize().multiplyScalar(dx);
    camera.position.add(panRight);
    controls.target.add(panRight);
    controls.update();
    controls.saveState();
}
