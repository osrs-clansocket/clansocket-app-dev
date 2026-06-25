import type { TimelineMigration } from "./timeline-migration-types.js";

export const migrate4to5: TimelineMigration = (raw) => ({ ...raw, schemaVersion: 5 });
