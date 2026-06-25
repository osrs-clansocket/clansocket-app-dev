import type Database from "better-sqlite3";
import { columnExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "001-add-guild-name-to-audit-log";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => !columnExists(db, "clan_audit_log", "guild_name"),
        "ALTER TABLE clan_audit_log ADD COLUMN guild_name TEXT",
    );
}
