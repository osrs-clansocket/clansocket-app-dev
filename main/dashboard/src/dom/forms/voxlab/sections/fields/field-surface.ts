import type { MaterialSettings } from "../../../../../shared/types/voxlab/material-types.js";

export type SurfaceFields = Pick<MaterialSettings, "tint" | "opacity" | "metalness" | "roughness">;
