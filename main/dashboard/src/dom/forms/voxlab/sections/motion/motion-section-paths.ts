import { pathNumber, pathStep, type PathSpec } from "../../../../../state/voxlab/registries/snapshot-registry.js";

export const MOTION_PATHS: ReadonlyArray<PathSpec> = [
    pathNumber("breatheAmplitude", "breatheAmplitude"),
    pathNumber("breathePeriodMs", "breathePeriodMs"),
    pathNumber("bobAmplitude", "bobAmplitude"),
    pathNumber("bobPeriodMs", "bobPeriodMs"),
    pathNumber("tiltStrength", "tiltStrength"),
    pathStep("breatheEnabled", "breatheEnabled"),
    pathStep("bobEnabled", "bobEnabled"),
    pathStep("tiltEnabled", "tiltEnabled"),
];
