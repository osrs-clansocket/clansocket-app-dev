import { Vector3, type Box3 } from "three";
import { CAMERA_FRONT_DISTANCE_MULTIPLIER } from "../../shared/constants/voxlab/viewport-constants.js";
import type { CameraView } from "../../shared/types/voxlab/viewport-types.js";

export function defaultFrontView(boundingBox: Box3, multiplier: number = CAMERA_FRONT_DISTANCE_MULTIPLIER): CameraView {
    const size = new Vector3();
    boundingBox.getSize(size);
    const center = new Vector3();
    boundingBox.getCenter(center);
    const dist = Math.max(size.x, size.y) * multiplier;
    return {
        position: [center.x, center.y, center.z + dist],
        target: [center.x, center.y, center.z],
    };
}
