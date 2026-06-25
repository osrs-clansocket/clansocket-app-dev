export const MATERIAL_SURFACE_KEYS = ["tint", "opacity", "metalness", "roughness", "flatShading"] as const;
export const MATERIAL_EMISSIVE_KEYS = ["emissiveColor", "emissiveIntensity"] as const;
export const MATERIAL_COAT_KEYS = [
    "clearcoat",
    "clearcoatRoughness",
    "ior",
    "sheen",
    "sheenColor",
    "anisotropy",
] as const;

export const LIGHT_KEY_KEYS = [
    "keyIntensity",
    "keyPositionX",
    "keyPositionY",
    "keyPositionZ",
    "shadowBias",
    "shadowRadius",
] as const;
export const LIGHT_FILL_KEYS = [
    "fillIntensity",
    "fillColor",
    "fillPositionX",
    "fillPositionY",
    "fillPositionZ",
] as const;
export const LIGHT_AMBIENT_KEYS = ["ambientIntensity"] as const;

export const POSTFX_VIGNETTE_KEYS = ["vignetteEnabled", "vignetteAmount", "vignetteColor"] as const;
export const POSTFX_CHROMATIC_KEYS = ["chromaticAberrationEnabled", "chromaticAberrationAmount"] as const;
export const POSTFX_CONTRAST_KEYS = ["contrastEnabled", "contrastAmount"] as const;
export const POSTFX_KEYS = [...POSTFX_VIGNETTE_KEYS, ...POSTFX_CHROMATIC_KEYS, ...POSTFX_CONTRAST_KEYS] as const;

export const BLOOM_KEYS = ["bloomEnabled", "bloomStrength", "bloomRadius", "bloomThreshold"] as const;
export const OUTLINE_KEYS = ["outlineEnabled", "outlineColor", "outlineThickness"] as const;
export const QUALITY_KEYS = ["fxaaEnabled", "msaaSamples", "supersample"] as const;
export const WORLD_KEYS = ["backgroundColor", "toneMapping", "exposure"] as const;
export const GRID_AXES_KEYS = ["gridColor", "gridSize", "gridDivisions", "gridFloorY", "axesLength"] as const;

export type MaterialSurfaceKey = (typeof MATERIAL_SURFACE_KEYS)[number];
export type MaterialEmissiveKey = (typeof MATERIAL_EMISSIVE_KEYS)[number];
export type MaterialCoatKey = (typeof MATERIAL_COAT_KEYS)[number];

export type LightKeyKey = (typeof LIGHT_KEY_KEYS)[number];
export type LightFillKey = (typeof LIGHT_FILL_KEYS)[number];
export type LightAmbientKey = (typeof LIGHT_AMBIENT_KEYS)[number];

export type PostfxKey = (typeof POSTFX_KEYS)[number];
export type BloomKey = (typeof BLOOM_KEYS)[number];
export type OutlineKey = (typeof OUTLINE_KEYS)[number];
export type QualityKey = (typeof QUALITY_KEYS)[number];
export type WorldKey = (typeof WORLD_KEYS)[number];
export type GridAxesKey = (typeof GRID_AXES_KEYS)[number];
