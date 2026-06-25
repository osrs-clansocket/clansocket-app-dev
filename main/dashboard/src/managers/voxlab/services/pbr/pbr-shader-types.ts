import type { PbrMapSlot } from "../../../../shared/types/voxlab/paint/paint-types.js";

export interface PbrChannelConfig {
    normal?: { sobelStrength: number };
    roughness?: { invert: boolean };
    metalness?: { threshold: number };
    ao?: { radius: number };
}

export interface PbrChannelResult {
    texture: import("three").Texture;
    pixels: { data: Uint8ClampedArray; width: number; height: number };
}

export type PbrGenResult = Partial<Record<PbrMapSlot, PbrChannelResult>>;
