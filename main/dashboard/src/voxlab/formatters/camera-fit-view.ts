import { Vector3, type Box3 } from "three";
import { CAMERA_FIT_DISTANCE_MULTIPLIER } from "../../shared/constants/voxlab/viewport-constants.js";
import type { CameraView } from "../../shared/types/voxlab/viewport-types.js";

export function defaultFitView(
    boundingBox: Box3,
    multiplier: number = CAMERA_FIT_DISTANCE_MULTIPLIER,
    aspect: number = 1,
): CameraView {
    const size = new Vector3();
    boundingBox.getSize(size);
    const center = new Vector3();
    boundingBox.getCenter(center);
    const effectiveX = aspect > 0 && aspect < 1 ? size.x / aspect : size.x;
    const dist = Math.max(effectiveX, size.y, size.z) * multiplier;
    return {
        position: [center.x + dist * 0.7, center.y + dist * 0.5, center.z + dist],
        target: [center.x, center.y, center.z],
    };
}
