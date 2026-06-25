import type { TimelineMigration } from "./timeline-migration-types.js";

export const migrate3to4: TimelineMigration = (raw) => ({
    ...raw,
    schemaVersion: 4,
    smoothing: raw.smoothing !== false,
});
