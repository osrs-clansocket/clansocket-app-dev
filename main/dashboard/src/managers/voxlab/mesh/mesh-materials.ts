import { MeshStandardMaterial, type Material } from "three";
import { materialByVariant } from "../../../voxlab/formatters/material-formatter.js";
import type { MaterialVariant } from "../../../shared/types/voxlab/viewport-types.js";

export function createMaterialsVariant(variant: MaterialVariant, onCreated: (m: Material) => void): Material[] {
    const flat = materialByVariant(variant);
    const smooth = materialByVariant(variant);
    flat.userData.voxlabRole = "flat";
    smooth.userData.voxlabRole = "smooth";
    if (smooth instanceof MeshStandardMaterial) smooth.flatShading = false;
    onCreated(flat);
    onCreated(smooth);
    return [flat, smooth];
}
