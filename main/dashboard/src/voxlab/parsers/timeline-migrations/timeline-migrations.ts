import type { TimelineMigration } from "./timeline-migration-types.js";
import { migrate1to2 } from "./timeline-migrate-1to2.js";
import { migrate2to3 } from "./timeline-migrate-2to3.js";
import { migrate3to4 } from "./timeline-migrate-3to4.js";
import { migrate4to5 } from "./timeline-migrate-4to5.js";

export type { TimelineMigration } from "./timeline-migration-types.js";

export const TIMELINE_MIGRATIONS: Record<number, TimelineMigration> = {
    1: migrate1to2,
    2: migrate2to3,
    3: migrate3to4,
    4: migrate4to5,
};
