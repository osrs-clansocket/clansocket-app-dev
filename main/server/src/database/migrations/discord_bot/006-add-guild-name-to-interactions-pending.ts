import type Database from "better-sqlite3";
import { columnExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "006-add-guild-name-to-interactions-pending";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => !columnExists(db, "discord_interactions_pending", "guild_name"),
        "ALTER TABLE discord_interactions_pending ADD COLUMN guild_name TEXT",
    );
}
