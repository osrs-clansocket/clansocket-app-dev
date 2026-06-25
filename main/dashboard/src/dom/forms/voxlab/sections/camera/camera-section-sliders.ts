import { createSliderInput } from "../../../../../voxlab/formatters/control-formatter.js";
import {
    CAMERA_POSITION_MAX,
    CAMERA_POSITION_MIN,
    DEFAULT_CAMERA,
} from "../../../../../shared/constants/voxlab/camera-constants.js";
import { STEP_TWENTIETH } from "../../../../../shared/constants/voxlab/slider-step-constants.js";
import { buildLensSliders } from "./camera-lens-sliders.js";
import { buildTailSliders } from "./camera-tail-sliders.js";

type Slider = ReturnType<typeof createSliderInput>;

export interface CameraSliderSet {
    fov: Slider;
    near: Slider;
    far: Slider;
    posX: Slider;
    posY: Slider;
    posZ: Slider;
    tgtX: Slider;
    tgtY: Slider;
    tgtZ: Slider;
    damping: Slider;
    fitMul: Slider;
    frontMul: Slider;
}

export function buildCameraSliders(): CameraSliderSet {
    const ps = (label: string, value: number): Slider =>
        createSliderInput({ label, value, min: CAMERA_POSITION_MIN, max: CAMERA_POSITION_MAX, step: STEP_TWENTIETH });
    return {
        ...buildLensSliders(),
        posX: ps("Position X", DEFAULT_CAMERA.positionX),
        posY: ps("Position Y", DEFAULT_CAMERA.positionY),
        posZ: ps("Position Z", DEFAULT_CAMERA.positionZ),
        tgtX: ps("Target X", DEFAULT_CAMERA.targetX),
        tgtY: ps("Target Y", DEFAULT_CAMERA.targetY),
        tgtZ: ps("Target Z", DEFAULT_CAMERA.targetZ),
        ...buildTailSliders(),
    };
}
