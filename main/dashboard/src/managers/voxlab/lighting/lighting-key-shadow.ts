import type { DirectionalLight } from "three";
import {
    DEFAULT_SHADOW_NORMAL_BIAS,
    SHADOW_CAMERA_FAR,
    SHADOW_CAMERA_HALF_EXTENT,
    SHADOW_CAMERA_NEAR,
    SHADOW_MAP_SIZE,
} from "../../../shared/constants/voxlab/lighting/light-constants.js";

export function configureKeyShadow(key: DirectionalLight): void {
    key.castShadow = false;
    key.shadow.mapSize.set(SHADOW_MAP_SIZE, SHADOW_MAP_SIZE);
    key.shadow.camera.left = -SHADOW_CAMERA_HALF_EXTENT;
    key.shadow.camera.right = SHADOW_CAMERA_HALF_EXTENT;
    key.shadow.camera.top = SHADOW_CAMERA_HALF_EXTENT;
    key.shadow.camera.bottom = -SHADOW_CAMERA_HALF_EXTENT;
    key.shadow.camera.near = SHADOW_CAMERA_NEAR;
    key.shadow.camera.far = SHADOW_CAMERA_FAR;
    key.shadow.camera.updateProjectionMatrix();
    key.shadow.normalBias = DEFAULT_SHADOW_NORMAL_BIAS;
}
