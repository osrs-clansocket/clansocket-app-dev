import type Database from "better-sqlite3";
import { columnExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "009-add-parent-name-to-discord-channels";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => !columnExists(db, "discord_channels", "parent_name"),
        "ALTER TABLE discord_channels ADD COLUMN parent_name TEXT",
    );
}
