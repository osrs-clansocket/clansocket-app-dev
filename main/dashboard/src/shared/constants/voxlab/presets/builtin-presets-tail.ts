import {
    bloom,
    chromaticAberration,
    coatSheen,
    contrast,
    emissive,
    outline,
    quality,
    shading,
    surface,
    vignette,
    world,
} from "./preset-section-factories.js";
import type { BuiltinPreset } from "./builtin-presets-constants.js";
import { makePreset } from "./builtin-presets-make.js";

const FLAT_SHADING_OFF = shading(false, false);
const NO_EMISSIVE = emissive("#000000", 0);
const NO_BLOOM = bloom(false, 0, 0, 0);
const NO_VIGNETTE = vignette(false, 0, "#000000");
const NO_CONTRAST = contrast(false, 0);
const NO_CHROMATIC = chromaticAberration(false, 0);
const STD_QUALITY = quality(true, 4, 1);

export const TAIL_PRESETS: ReadonlyArray<BuiltinPreset> = [
    makePreset("vibrant", "Vibrant", {
        surface: surface("#ffffff", 1.0, 0.2, 0.4),
        shading: FLAT_SHADING_OFF,
        emissive: emissive("#321f0a", 0.35),
        coatSheen: coatSheen({
            clearcoat: 0.3,
            clearcoatRoughness: 0.1,
            ior: 1.5,
            sheen: 0.4,
            sheenColor: "#f5ca7a",
            anisotropy: 0.1,
        }),
        world: world("#0e0e0e", "agx", 1.2),
        bloom: bloom(true, 1.2, 0.8, 0.6),
        outline: outline(false, "#f5ca7a", 1),
        vignette: vignette(true, 0.3, "#0a0908"),
        contrast: contrast(true, 0.25),
        chromaticAberration: chromaticAberration(true, 0.2),
        quality: STD_QUALITY,
    }),
    makePreset("wireframe", "Wireframe", {
        display: {
            material: "standard",
            smoothShading: false,
            wireframe: true,
            wireframeColor: "#f5ca7a",
            wireframeOpacity: 0.9,
            showGrid: true,
            castShadows: false,
        },
        surface: surface("#1a1a1a", 0.15, 0, 1),
        shading: shading(false, true),
        emissive: NO_EMISSIVE,
        world: world("#0e0e0e", "none", 1.0),
        bloom: NO_BLOOM,
        vignette: NO_VIGNETTE,
        contrast: NO_CONTRAST,
        chromaticAberration: NO_CHROMATIC,
    }),
];
