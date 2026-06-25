import type Database from "better-sqlite3";
import { columnExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "025-add-guild-name-to-draft-changes";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => !columnExists(db, "discord_draft_changes", "guild_name"),
        "ALTER TABLE discord_draft_changes ADD COLUMN guild_name TEXT",
    );
}
