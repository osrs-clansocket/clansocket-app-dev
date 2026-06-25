import { isObject, type TimelineMigration } from "./timeline-migration-types.js";
import { migrateCameraPart } from "./migrate-camera-part.js";
import { rewriteCameraTracks } from "./rewrite-camera-tracks.js";

const SCHEMA_V3 = 3;

export const migrate2to3: TimelineMigration = (raw) => {
    const initial: Record<string, unknown> = isObject(raw.initialSnapshot)
        ? { ...(raw.initialSnapshot as Record<string, unknown>) }
        : { parts: {} };
    const parts: Record<string, unknown> = isObject(initial.parts)
        ? { ...(initial.parts as Record<string, unknown>) }
        : {};
    migrateCameraPart(parts);
    initial.parts = parts;
    initial.schemaVersion = SCHEMA_V3;
    return { ...raw, schemaVersion: 3, initialSnapshot: initial, tracks: rewriteCameraTracks(raw.tracks) };
};
