import type Database from "better-sqlite3";
import { columnExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "020-add-guild-name-to-auto-hooks";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => !columnExists(db, "discord_auto_hooks", "guild_name"),
        "ALTER TABLE discord_auto_hooks ADD COLUMN guild_name TEXT",
    );
}
