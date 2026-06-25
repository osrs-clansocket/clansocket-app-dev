import type { MaterialSettings } from "../../../../../shared/types/voxlab/material-types.js";

export type CoatSheenFields = Pick<
    MaterialSettings,
    "clearcoat" | "clearcoatRoughness" | "ior" | "sheen" | "sheenColor" | "anisotropy"
>;
