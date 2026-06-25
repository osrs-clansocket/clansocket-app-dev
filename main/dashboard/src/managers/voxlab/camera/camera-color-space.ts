import { LinearSRGBColorSpace, SRGBColorSpace, type ColorSpace } from "three";
import type { ColorSpaceMode } from "../../../shared/constants/voxlab/effect-constants.js";

const DisplayP3ColorSpace = "display-p3" as ColorSpace;

export function pickColorSpace(mode: ColorSpaceMode): ColorSpace {
    if (mode === "linear") return LinearSRGBColorSpace;
    if (mode === "display-p3") return DisplayP3ColorSpace;
    return SRGBColorSpace;
}
