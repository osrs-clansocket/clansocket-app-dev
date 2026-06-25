import { TIMELINE_SCHEMA_VERSION } from "../../shared/types/voxlab/timeline-types.js";
import { applyMigrations } from "./timeline-apply-migrations.js";
import { isTimelineShape } from "./timeline-is-shape.js";
import { isObject, type ParsedTimeline } from "./timeline-parser-types.js";

export type { TimelineMigration } from "./timeline-migrations/timeline-migrations.js";
export type { ParsedTimeline } from "./timeline-parser-types.js";

const ERROR_KEY_PREVIEW_COUNT = 8;

export function parseTimelineJson(jsonText: string, fileSize: number): ParsedTimeline {
    const initial = JSON.parse(jsonText);
    if (!isObject(initial)) {
        throw new Error(`File does not look like a Voxlab timeline (got ${typeof initial})`);
    }
    const migrated = applyMigrations(initial as Record<string, unknown>);
    if (!isTimelineShape(migrated)) {
        throw new Error(
            `File does not look like a Voxlab timeline (post-migration keys: ${JSON.stringify(Object.keys(migrated).slice(0, ERROR_KEY_PREVIEW_COUNT))})`,
        );
    }
    if (migrated.schemaVersion !== TIMELINE_SCHEMA_VERSION) {
        throw new Error(
            `Unsupported timeline schemaVersion ${String(migrated.schemaVersion)} (expected ${TIMELINE_SCHEMA_VERSION})`,
        );
    }
    return { data: migrated, fileSize };
}
