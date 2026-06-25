import type { Scene } from "three";
import type { LightSet } from "./lighting-build-lights.js";

export function addLightsScene(scene: Scene, lights: LightSet): void {
    scene.add(lights.ambient);
    scene.add(lights.key);
    scene.add(lights.fill);
    scene.add(lights.rim);
    scene.add(lights.top);
    scene.add(lights.bottom);
    scene.add(lights.hemi);
}
