import type { EffectsSettings } from "../../types/voxlab/effects-types.js";
export type { ColorSpaceMode } from "./effect-options.js";
export { TONE_MAPPING_OPTIONS, COLOR_SPACE_OPTIONS, TARGET_FPS_OPTIONS } from "./effect-options.js";

export const DEFAULT_EFFECTS: EffectsSettings = {
    backgroundColor: "#0e0e0e",
    toneMapping: "none",
    exposure: 1.0,
    bloomEnabled: false,
    bloomStrength: 0.6,
    bloomRadius: 0.5,
    bloomThreshold: 0.85,
    outlineEnabled: false,
    outlineColor: "#f5ca7a",
    outlineThickness: 2.0,
    fxaaEnabled: false,
    gridColor: "#f5ca7a",
    gridSize: 4,
    gridDivisions: 20,
    gridFloorY: -0.5,
    axesLength: 0.6,
    vignetteEnabled: false,
    vignetteAmount: 0.4,
    vignetteColor: "#000000",
    chromaticAberrationEnabled: false,
    chromaticAberrationAmount: 0.3,
    contrastEnabled: false,
    contrastAmount: 0.2,
    msaaSamples: 4,
    supersample: 1,
};

export const PIXEL_RATIO_MIN = 0.5;
export const PIXEL_RATIO_MAX = 3;
export const PIXEL_RATIO_STEP = 0.1;

export const EXPOSURE_MIN = 0;
export const EXPOSURE_MAX = 2;
export const EXPOSURE_STEP = 0.05;

export const BLOOM_STRENGTH_MAX = 3;
export const BLOOM_RADIUS_MAX = 1;
export const BLOOM_THRESHOLD_MAX = 1;
export const OUTLINE_THICKNESS_MAX = 8;

export const GRID_SIZE_MIN = 0.5;
export const GRID_SIZE_MAX = 20;
export const GRID_DIVISIONS_MIN = 2;
export const GRID_DIVISIONS_MAX = 80;
export const GRID_FLOOR_Y_MIN = -5;
export const GRID_FLOOR_Y_MAX = 5;
export const AXES_LENGTH_MIN = 0.1;
export const AXES_LENGTH_MAX = 4;

export const VIGNETTE_AMOUNT_MIN = 0;
export const VIGNETTE_AMOUNT_MAX = 2;
export const CHROMATIC_ABERRATION_AMOUNT_MIN = 0;
export const CHROMATIC_ABERRATION_AMOUNT_MAX = 1;
export const CONTRAST_AMOUNT_MIN = -1;
export const CONTRAST_AMOUNT_MAX = 1;
export const MSAA_SAMPLES_MIN = 0;
export const MSAA_SAMPLES_MAX = 8;
export const MSAA_SAMPLES_STEP = 2;
export const SUPERSAMPLE_MIN = 1;
export const SUPERSAMPLE_MAX = 3;
export const SUPERSAMPLE_STEP = 0.25;
