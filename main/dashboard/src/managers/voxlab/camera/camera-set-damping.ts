import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function setDampingFactor(controls: OrbitControls, factor: number): void {
    if (Number.isFinite(factor) && factor > 0) controls.dampingFactor = factor;
}
