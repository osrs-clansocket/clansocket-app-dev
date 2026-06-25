import { SNAPSHOT_SCHEMA_VERSION } from "../../shared/types/voxlab/snapshot-types.js";
import { SNAPSHOT_MIGRATIONS } from "./snapshot-migration-registry.js";

const MIGRATION_LOOP_SAFETY_LIMIT = 16;

export function applyMigrations(raw: Record<string, unknown>): Record<string, unknown> {
    let current = raw;
    let safetyCounter = 0;
    while (typeof current.schemaVersion === "number" && current.schemaVersion < SNAPSHOT_SCHEMA_VERSION) {
        const migrate = SNAPSHOT_MIGRATIONS[current.schemaVersion];
        if (!migrate) {
            throw new Error(
                `No snapshot migration registered from v${current.schemaVersion} to v${SNAPSHOT_SCHEMA_VERSION}`,
            );
        }
        current = migrate(current);
        safetyCounter++;
        if (safetyCounter > MIGRATION_LOOP_SAFETY_LIMIT) {
            throw new Error(`Snapshot migration loop detected (counter=${safetyCounter})`);
        }
    }
    return current;
}
