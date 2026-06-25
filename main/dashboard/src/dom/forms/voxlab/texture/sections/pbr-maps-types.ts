import type { PbrMapSlot } from "../../../../../shared/types/voxlab/paint/paint-types.js";

export type IntensityKey = "normalScale" | "roughnessIntensity" | "metalnessIntensity" | "aoIntensity";

export const INTENSITY_TO_SLOT: Record<IntensityKey, PbrMapSlot> = {
    normalScale: "normal",
    roughnessIntensity: "roughness",
    metalnessIntensity: "metalness",
    aoIntensity: "ao",
};

export const SLOT_LABELS: Record<PbrMapSlot, string> = {
    normal: "Normal map",
    roughness: "Roughness map",
    metalness: "Metalness map",
    ao: "Ambient occlusion map",
};

export const SLOT_HUMAN_LABELS: Record<PbrMapSlot, string> = {
    normal: "normal",
    roughness: "roughness",
    metalness: "metalness",
    ao: "AO",
};
