import type Database from "better-sqlite3";
import { columnExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "026-add-guild-name-to-draft-change-deps";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => !columnExists(db, "discord_draft_change_deps", "guild_name"),
        "ALTER TABLE discord_draft_change_deps ADD COLUMN guild_name TEXT",
    );
}
