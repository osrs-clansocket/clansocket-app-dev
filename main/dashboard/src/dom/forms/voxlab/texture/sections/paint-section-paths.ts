import {
    pathColor,
    pathNumber,
    pathStep,
    type PathSpec,
} from "../../../../../state/voxlab/registries/snapshot-registry.js";

export const BRUSH_PATHS: ReadonlyArray<PathSpec> = [
    pathColor("color", "color"),
    pathNumber("radius", "radius"),
    pathNumber("falloffSigma", "falloffSigma"),
    pathNumber("opacity", "opacity"),
    pathStep("mode", "mode"),
    pathStep("paintMode", "paintMode"),
    pathStep("eyedropper", "eyedropper"),
    pathStep("mirrorX", "mirrorX"),
    pathStep("mirrorY", "mirrorY"),
    pathStep("mirrorZ", "mirrorZ"),
    pathStep("hideBackFaces", "hideBackFaces"),
];
