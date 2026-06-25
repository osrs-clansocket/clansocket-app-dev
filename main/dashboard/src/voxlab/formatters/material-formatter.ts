import {
    DoubleSide,
    MeshBasicMaterial,
    MeshDepthMaterial,
    MeshNormalMaterial,
    MeshPhysicalMaterial,
    type Material,
} from "three";
import { STANDARD_METALNESS, STANDARD_ROUGHNESS } from "../../shared/constants/voxlab/material-constants.js";
import { GOLD_COLOR } from "../../shared/constants/voxlab/viewport-constants.js";
import type { MaterialVariant } from "../../shared/types/voxlab/viewport-types.js";

const MATERIAL_FACTORIES: Record<MaterialVariant, () => Material> = {
    normal: () => new MeshNormalMaterial({ side: DoubleSide }),
    depth: () => new MeshDepthMaterial({ side: DoubleSide }),
    basic: () => new MeshBasicMaterial({ color: GOLD_COLOR, side: DoubleSide }),
    standard: () =>
        new MeshPhysicalMaterial({
            vertexColors: true,
            metalness: STANDARD_METALNESS,
            roughness: STANDARD_ROUGHNESS,
            side: DoubleSide,
        }),
};

export function materialByVariant(variant: MaterialVariant): Material {
    return (MATERIAL_FACTORIES[variant] ?? MATERIAL_FACTORIES.standard)();
}
