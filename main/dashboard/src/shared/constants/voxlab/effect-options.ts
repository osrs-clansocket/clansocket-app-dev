import type { ToneMappingOption } from "../../types/voxlab/effects-types.js";

function opt<V extends string>(value: V, label: string): { value: V; label: string } {
    return { value, label };
}

export type ColorSpaceMode = "srgb" | "linear" | "display-p3";

export const TONE_MAPPING_OPTIONS: readonly ToneMappingOption[] = [
    opt("aces", "ACES Filmic"),
    opt("agx", "AgX"),
    opt("reinhard", "Reinhard"),
    opt("cineon", "Cineon"),
    opt("linear", "Linear"),
    opt("none", "None"),
] as ReadonlyArray<ToneMappingOption>;

export const COLOR_SPACE_OPTIONS: readonly { value: ColorSpaceMode; label: string }[] = [
    opt<ColorSpaceMode>("srgb", "sRGB"),
    opt<ColorSpaceMode>("linear", "Linear sRGB"),
    opt<ColorSpaceMode>("display-p3", "Display P3"),
];

export const TARGET_FPS_OPTIONS: readonly { value: string; label: string }[] = [
    opt("0", "Unlimited"),
    opt("120", "120 fps"),
    opt("60", "60 fps"),
    opt("30", "30 fps"),
    opt("24", "24 fps"),
];
