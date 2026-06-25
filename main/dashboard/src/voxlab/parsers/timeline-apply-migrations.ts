import { TIMELINE_SCHEMA_VERSION } from "../../shared/types/voxlab/timeline-types.js";
import { TIMELINE_MIGRATIONS, type TimelineMigration } from "./timeline-migrations/timeline-migrations.js";

const MIGRATION_LOOP_SAFETY_LIMIT = 16;

export function applyMigrations(raw: Record<string, unknown>): Record<string, unknown> {
    let current = raw;
    let safetyCounter = 0;
    while (typeof current.schemaVersion === "number" && current.schemaVersion < TIMELINE_SCHEMA_VERSION) {
        const migrate: TimelineMigration | undefined = TIMELINE_MIGRATIONS[current.schemaVersion];
        if (!migrate) {
            throw new Error(
                `No timeline migration registered from v${current.schemaVersion} to v${TIMELINE_SCHEMA_VERSION}`,
            );
        }
        current = migrate(current);
        safetyCounter++;
        if (safetyCounter > MIGRATION_LOOP_SAFETY_LIMIT) {
            throw new Error(`Timeline migration loop detected (counter=${safetyCounter})`);
        }
    }
    return current;
}
