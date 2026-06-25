import type { SceneSnapshot } from "./snapshot-types.js";
import type { GeneratedTrack } from "./preset-track-types.js";

export type AnimationCategory = "Camera" | "Material" | "Lighting" | "Post-FX" | "Combo";

export interface PresetContext {
    snapshot: SceneSnapshot;
    durationMs: number;
}

export interface AnimationPresetDefinition {
    id: string;
    name: string;
    category: AnimationCategory;
    defaultDurationMs: number;
    description?: string;
    generate(ctx: PresetContext): GeneratedTrack[];
}
