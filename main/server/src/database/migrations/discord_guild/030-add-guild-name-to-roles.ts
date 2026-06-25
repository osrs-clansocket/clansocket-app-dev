import type Database from "better-sqlite3";
import { columnExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "030-add-guild-name-to-roles";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => !columnExists(db, "discord_roles", "guild_name"),
        "ALTER TABLE discord_roles ADD COLUMN guild_name TEXT",
    );
}
