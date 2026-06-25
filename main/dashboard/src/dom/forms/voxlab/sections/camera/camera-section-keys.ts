import type { CameraSettings } from "../../../../../shared/types/voxlab/camera-types.js";

export interface CameraInputs {
    fov: HTMLInputElement;
    near: HTMLInputElement;
    far: HTMLInputElement;
    posX: HTMLInputElement;
    posY: HTMLInputElement;
    posZ: HTMLInputElement;
    tgtX: HTMLInputElement;
    tgtY: HTMLInputElement;
    tgtZ: HTMLInputElement;
    damping: HTMLInputElement;
    fitMul: HTMLInputElement;
    frontMul: HTMLInputElement;
}

export const FIELD_KEYS: ReadonlyArray<[keyof CameraInputs, keyof CameraSettings]> = [
    ["fov", "fov"],
    ["near", "near"],
    ["far", "far"],
    ["posX", "positionX"],
    ["posY", "positionY"],
    ["posZ", "positionZ"],
    ["tgtX", "targetX"],
    ["tgtY", "targetY"],
    ["tgtZ", "targetZ"],
    ["damping", "dampingFactor"],
    ["fitMul", "fitDistanceMultiplier"],
    ["frontMul", "frontDistanceMultiplier"],
];
