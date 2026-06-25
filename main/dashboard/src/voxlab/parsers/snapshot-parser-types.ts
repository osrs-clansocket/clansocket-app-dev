import type { SceneSnapshot } from "../../shared/types/voxlab/snapshot-types.js";

export interface ParsedSnapshot {
    data: SceneSnapshot;
    fileSize: number;
}

export type SnapshotMigration = (raw: Record<string, unknown>) => Record<string, unknown>;
