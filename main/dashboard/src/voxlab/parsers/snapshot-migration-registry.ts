import {
    migrate10to11,
    migrate11to12,
    migrate12to13,
    migrate4to5,
    migrate5to6,
    migrate6to7,
    migrate7to8,
    migrate8to9,
    migrate9to10,
} from "./snapshot-migrations/parser-migrations-recent.js";
import { migrate1to2, migrate2to3, migrate3to4 } from "./snapshot-migrations/parser-migrations-early.js";
import type { SnapshotMigration } from "./snapshot-parser-types.js";

export const SNAPSHOT_MIGRATIONS: Record<number, SnapshotMigration> = {
    1: migrate1to2,
    2: migrate2to3,
    3: migrate3to4,
    4: migrate4to5,
    5: migrate5to6,
    6: migrate6to7,
    7: migrate7to8,
    8: migrate8to9,
    9: migrate9to10,
    10: migrate10to11,
    11: migrate11to12,
    12: migrate12to13,
};
