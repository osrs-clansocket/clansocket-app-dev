import type { Box3, Mesh, PerspectiveCamera } from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
    defaultFitView,
    defaultFrontView as frontViewFn,
    defaultView,
} from "../../../voxlab/formatters/camera-formatter.js";
import type { CameraView } from "../../../shared/types/voxlab/viewport-types.js";

export function applyView(camera: PerspectiveCamera, controls: OrbitControls, view: CameraView): void {
    camera.position.set(...view.position);
    camera.lookAt(...view.target);
    controls.target.set(...view.target);
}

export interface ResetCameraArgs {
    camera: PerspectiveCamera;
    controls: OrbitControls;
    boundingBox: Box3 | null;
    fitMultiplier: number | undefined;
    frameAspect: number;
}

export function resetCameraTo(args: ResetCameraArgs): void {
    const { camera, controls, boundingBox, fitMultiplier, frameAspect } = args;
    applyView(camera, controls, boundingBox ? defaultFitView(boundingBox, fitMultiplier, frameAspect) : defaultView());
}

export function frontMeshView(
    camera: PerspectiveCamera,
    controls: OrbitControls,
    mesh: Mesh,
    frontMultiplier?: number,
): void {
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    const box = mesh.geometry.boundingBox;
    if (box) applyView(camera, controls, frontViewFn(box, frontMultiplier));
}
