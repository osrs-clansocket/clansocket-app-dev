import type Database from "better-sqlite3";
import { columnExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "033-add-guild-name-to-user-permissions";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => !columnExists(db, "discord_user_permissions", "guild_name"),
        "ALTER TABLE discord_user_permissions ADD COLUMN guild_name TEXT",
    );
}
