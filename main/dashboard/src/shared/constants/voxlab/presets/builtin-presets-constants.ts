import type { SceneSnapshot } from "../../../types/voxlab/snapshot-types.js";
import {
    ambient,
    bloom,
    chromaticAberration,
    coatSheen,
    contrast,
    emissive,
    fillLight,
    keyLight,
    outline,
    quality,
    shading,
    surface,
    vignette,
    world,
} from "./preset-section-factories.js";
import { makePreset } from "./builtin-presets-make.js";
import { TAIL_PRESETS } from "./builtin-presets-tail.js";

export interface BuiltinPreset {
    id: string;
    name: string;
    snapshot: SceneSnapshot;
}

const FLAT_SHADING_OFF = shading(false, false);
const NO_EMISSIVE = emissive("#000000", 0);
const NO_BLOOM = bloom(false, 0, 0, 0);
const NO_CHROMATIC = chromaticAberration(false, 0);
const STD_QUALITY = quality(true, 4, 1);
const STD_COAT_OFF = coatSheen({
    clearcoat: 0,
    clearcoatRoughness: 0,
    ior: 1.5,
    sheen: 0,
    sheenColor: "#ffffff",
    anisotropy: 0,
});

export const BUILTIN_PRESETS: ReadonlyArray<BuiltinPreset> = [
    makePreset("hero-logo", "Hero Logo", {
        surface: surface("#f5ca7a", 1.0, 0.6, 0.3),
        shading: FLAT_SHADING_OFF,
        emissive: emissive("#9f6b1c", 0.25),
        coatSheen: coatSheen({
            clearcoat: 0.4,
            clearcoatRoughness: 0.15,
            ior: 1.5,
            sheen: 0,
            sheenColor: "#ffffff",
            anisotropy: 0,
        }),
        ambient: ambient(0.35),
        keyLight: keyLight({
            keyIntensity: 1.4,
            keyPositionX: 2,
            keyPositionY: 3,
            keyPositionZ: 2.5,
            shadowBias: -0.0005,
            shadowRadius: 4,
        }),
        fillLight: fillLight({
            fillIntensity: 0.6,
            fillColor: "#f5ca7a",
            fillPositionX: -2.5,
            fillPositionY: -1,
            fillPositionZ: -2,
        }),
        world: world("#0a0907", "aces", 1.1),
        bloom: bloom(true, 0.8, 0.6, 0.7),
        outline: outline(false, "#f5ca7a", 2),
        vignette: vignette(true, 0.4, "#000000"),
        contrast: contrast(true, 0.15),
        chromaticAberration: NO_CHROMATIC,
        quality: STD_QUALITY,
    }),
    makePreset("glass", "Glass", {
        surface: surface("#d8e6f2", 0.55, 0.0, 0.05),
        shading: FLAT_SHADING_OFF,
        emissive: NO_EMISSIVE,
        coatSheen: coatSheen({
            clearcoat: 1.0,
            clearcoatRoughness: 0.0,
            ior: 1.7,
            sheen: 0,
            sheenColor: "#ffffff",
            anisotropy: 0,
        }),
        world: world("#0e0e0e", "aces", 1.0),
        bloom: bloom(true, 0.5, 0.7, 0.85),
        outline: outline(false, "#ffffff", 1.5),
        vignette: vignette(false, 0, "#000000"),
        contrast: contrast(false, 0),
        chromaticAberration: chromaticAberration(true, 0.15),
        quality: quality(true, 8, 1.5),
    }),
    makePreset("stealth", "Stealth", {
        surface: surface("#1a1a1a", 1.0, 0.85, 0.45),
        shading: FLAT_SHADING_OFF,
        emissive: NO_EMISSIVE,
        coatSheen: STD_COAT_OFF,
        ambient: ambient(0.15),
        keyLight: keyLight({
            keyIntensity: 0.9,
            keyPositionX: 2,
            keyPositionY: 3,
            keyPositionZ: 2.5,
            shadowBias: -0.0005,
            shadowRadius: 6,
        }),
        fillLight: fillLight({
            fillIntensity: 0.2,
            fillColor: "#3a3a45",
            fillPositionX: -2.5,
            fillPositionY: -1,
            fillPositionZ: -2,
        }),
        world: world("#050505", "aces", 0.9),
        bloom: NO_BLOOM,
        vignette: vignette(true, 0.7, "#000000"),
        contrast: contrast(true, 0.3),
        chromaticAberration: NO_CHROMATIC,
        quality: STD_QUALITY,
    }),
    ...TAIL_PRESETS,
];
