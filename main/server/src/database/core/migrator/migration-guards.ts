import type Database from "better-sqlite3";

export { pragmaTableInfo } from "./pragma-table-info.js";
export { sqliteEntityExists, tableExists, indexExists, columnExists } from "./entity-existence.js";

export type GuardedAction = string | ((db: Database.Database) => void);

export function guarded(db: Database.Database, predicate: () => boolean, action: GuardedAction): void {
    if (!predicate()) return;
    if (typeof action === "string") {
        db.exec(action);
        return;
    }
    action(db);
}
