import type Database from "better-sqlite3";
import { columnExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "029-add-guild-name-to-members";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => !columnExists(db, "discord_members", "guild_name"),
        "ALTER TABLE discord_members ADD COLUMN guild_name TEXT",
    );
}
