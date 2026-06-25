import { SNAPSHOT_SCHEMA_VERSION } from "../../shared/types/voxlab/snapshot-types.js";
import { isObject } from "./is-object.js";
import { applyMigrations } from "./snapshot-apply-migrations.js";
import { isSnapshotShape } from "./snapshot-is-shape.js";
import type { ParsedSnapshot } from "./snapshot-parser-types.js";

export type { ParsedSnapshot, SnapshotMigration } from "./snapshot-parser-types.js";

const ERROR_KEY_PREVIEW_COUNT = 8;

export function parseSnapshotJson(jsonText: string, fileSize: number): ParsedSnapshot {
    const initial = JSON.parse(jsonText);
    if (!isObject(initial)) {
        throw new Error(`File does not look like a Voxlab scene snapshot (got ${typeof initial})`);
    }
    const migrated = applyMigrations(initial as Record<string, unknown>);
    if (!isSnapshotShape(migrated)) {
        throw new Error(
            `File does not look like a Voxlab scene snapshot (post-migration keys: ${JSON.stringify(Object.keys(migrated).slice(0, ERROR_KEY_PREVIEW_COUNT))})`,
        );
    }
    if (migrated.schemaVersion !== SNAPSHOT_SCHEMA_VERSION) {
        throw new Error(
            `Unsupported snapshot schemaVersion ${String(migrated.schemaVersion)} (expected ${SNAPSHOT_SCHEMA_VERSION})`,
        );
    }
    return { data: migrated, fileSize };
}
