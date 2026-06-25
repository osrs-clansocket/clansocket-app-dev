export type PbrMapSlot = "normal" | "roughness" | "metalness" | "ao";

export interface PbrMapsSettings {
    normal: string | null;
    roughness: string | null;
    metalness: string | null;
    ao: string | null;
    normalScale: number;
    roughnessIntensity: number;
    metalnessIntensity: number;
    aoIntensity: number;
}

export interface PbrIntensitySettings {
    normal: number;
    roughness: number;
    metalness: number;
    ao: number;
}

export type PbrMapsChange = PbrMapsSettings;

export interface PbrMapApply {
    slot: PbrMapSlot;
    dataUrl: string | null;
}

export interface PbrGenerate {
    normal: boolean;
    roughness: boolean;
    metalness: boolean;
    ao: boolean;
    sobelStrength: number;
    metalnessThreshold: number;
    aoRadius: number;
}
