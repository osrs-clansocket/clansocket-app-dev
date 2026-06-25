import {
    LAYOUT_SCHEMA_VERSION,
    type LayoutEntry,
    type LayoutState,
} from "../../../shared/types/voxlab/layout-types.js";
import { clearStored, readStored, writeStored } from "../../../state/persistence/index.js";

const STORAGE_KEY = "voxlab.layout.v1";
const MIGRATION_LOOP_SAFETY_LIMIT = 16;

export type LayoutMigration = (raw: Record<string, unknown>) => Record<string, unknown>;

const MIGRATIONS: Record<number, LayoutMigration> = {};

export class LayoutPersistenceService {
    load(): LayoutState | null {
        try {
            const parsed = readStored<Record<string, unknown>>(STORAGE_KEY);
            if (parsed === undefined || !isObject(parsed)) {
                return null;
            }
            const migrated = applyMigrations(parsed);
            if (!isLayoutShape(migrated)) {
                return null;
            }
            return migrated;
        } catch {
            return null;
        }
    }

    save(state: LayoutState): void {
        writeStored(STORAGE_KEY, state);
    }

    clear(): void {
        clearStored(STORAGE_KEY);
    }
}

function applyMigrations(raw: Record<string, unknown>): Record<string, unknown> {
    let current = raw;
    let safety = 0;
    while (typeof current.schemaVersion === "number" && current.schemaVersion < LAYOUT_SCHEMA_VERSION) {
        const migrate = MIGRATIONS[current.schemaVersion];
        if (!migrate) {
            throw new Error(
                `No layout migration registered from v${current.schemaVersion} to v${LAYOUT_SCHEMA_VERSION}`,
            );
        }
        current = migrate(current);
        safety++;
        if (safety > MIGRATION_LOOP_SAFETY_LIMIT) {
            throw new Error(`Layout migration loop detected (counter=${safety})`);
        }
    }
    return current;
}

function isLayoutShape(value: unknown): value is LayoutState {
    if (!isObject(value)) {
        return false;
    }
    const v = value as Record<string, unknown>;
    if (v.schemaVersion !== LAYOUT_SCHEMA_VERSION) {
        return false;
    }
    return isEntryArray(v.left) && isEntryArray(v.right);
}

function isEntryArray(value: unknown): value is LayoutEntry[] {
    if (!Array.isArray(value)) {
        return false;
    }
    for (const entry of value) {
        if (!isObject(entry)) {
            return false;
        }
        const e = entry as Record<string, unknown>;
        if (typeof e.id !== "string" || typeof e.collapsed !== "boolean") {
            return false;
        }
    }
    return true;
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
