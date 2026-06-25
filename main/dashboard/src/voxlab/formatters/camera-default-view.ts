import { CAMERA_DEFAULT_POSITION, CAMERA_DEFAULT_TARGET } from "../../shared/constants/voxlab/viewport-constants.js";
import type { CameraView } from "../../shared/types/voxlab/viewport-types.js";

export function defaultView(): CameraView {
    return {
        position: [...CAMERA_DEFAULT_POSITION],
        target: [...CAMERA_DEFAULT_TARGET],
    };
}
