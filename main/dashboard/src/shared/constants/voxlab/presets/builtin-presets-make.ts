import { SNAPSHOT_SCHEMA_VERSION } from "../../../types/voxlab/snapshot-types.js";
import type { BuiltinPreset } from "./builtin-presets-constants.js";

export function makePreset(id: string, name: string, parts: Record<string, unknown>): BuiltinPreset {
    return { id, name, snapshot: { schemaVersion: SNAPSHOT_SCHEMA_VERSION, capturedAt: 0, parts } };
}
