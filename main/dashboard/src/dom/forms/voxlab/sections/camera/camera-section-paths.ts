import { pathNumber, type PathSpec } from "../../../../../state/voxlab/registries/snapshot-registry.js";

export const CAMERA_PATHS: ReadonlyArray<PathSpec> = [
    pathNumber("fov", "fov"),
    pathNumber("near", "near"),
    pathNumber("far", "far"),
    pathNumber("positionX", "positionX"),
    pathNumber("positionY", "positionY"),
    pathNumber("positionZ", "positionZ"),
    pathNumber("targetX", "targetX"),
    pathNumber("targetY", "targetY"),
    pathNumber("targetZ", "targetZ"),
];
