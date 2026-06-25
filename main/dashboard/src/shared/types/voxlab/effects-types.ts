export type ToneMappingMode = "none" | "linear" | "reinhard" | "cineon" | "aces" | "agx";

export interface ToneMappingOption {
    value: ToneMappingMode;
    label: string;
}

export interface EffectsSettings {
    backgroundColor: string;
    toneMapping: ToneMappingMode;
    exposure: number;
    bloomEnabled: boolean;
    bloomStrength: number;
    bloomRadius: number;
    bloomThreshold: number;
    outlineEnabled: boolean;
    outlineColor: string;
    outlineThickness: number;
    fxaaEnabled: boolean;
    gridColor: string;
    gridSize: number;
    gridDivisions: number;
    gridFloorY: number;
    axesLength: number;
    vignetteEnabled: boolean;
    vignetteAmount: number;
    vignetteColor: string;
    chromaticAberrationEnabled: boolean;
    chromaticAberrationAmount: number;
    contrastEnabled: boolean;
    contrastAmount: number;
    msaaSamples: number;
    supersample: number;
}
