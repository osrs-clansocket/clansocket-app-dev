import type Database from "better-sqlite3";
import { columnExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "011-add-channel-name-to-channel-pins";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => !columnExists(db, "discord_channel_pins", "channel_name"),
        "ALTER TABLE discord_channel_pins ADD COLUMN channel_name TEXT",
    );
}
