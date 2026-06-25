import type Database from "better-sqlite3";
import { columnExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "016-rename-author-name-in-channel-pins";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () =>
            columnExists(db, "discord_channel_pins", "author_name") &&
            !columnExists(db, "discord_channel_pins", "author_user_name"),
        "ALTER TABLE discord_channel_pins RENAME COLUMN author_name TO author_user_name",
    );
}
