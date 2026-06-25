import type { SceneSnapshot } from "../../shared/types/voxlab/snapshot-types.js";
import { isObject } from "./is-object.js";

export function isSnapshotShape(value: unknown): value is SceneSnapshot {
    if (!isObject(value)) {
        return false;
    }
    const v = value as Record<string, unknown>;
    if (typeof v.schemaVersion !== "number" || typeof v.capturedAt !== "number") {
        return false;
    }
    return isObject(v.parts);
}
