import type Database from "better-sqlite3";
import { columnExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "032-add-guild-name-to-server-stickers";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => !columnExists(db, "discord_server_stickers", "guild_name"),
        "ALTER TABLE discord_server_stickers ADD COLUMN guild_name TEXT",
    );
}
