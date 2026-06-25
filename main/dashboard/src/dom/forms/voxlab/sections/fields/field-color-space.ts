import type { ColorSpaceMode } from "../../../../../shared/constants/voxlab/effect-constants.js";

export interface ColorSpaceFields {
    colorSpace: ColorSpaceMode;
}

export const DEFAULT_COLOR_SPACE: ColorSpaceFields = { colorSpace: "srgb" };
