import type Database from "better-sqlite3";
import { columnExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "021-add-guild-name-to-channels";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => !columnExists(db, "discord_channels", "guild_name"),
        "ALTER TABLE discord_channels ADD COLUMN guild_name TEXT",
    );
}
