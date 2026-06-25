import type Database from "better-sqlite3";
import { columnExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "012-add-channel-name-to-role-overwrites";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => !columnExists(db, "discord_channel_role_overwrites", "channel_name"),
        "ALTER TABLE discord_channel_role_overwrites ADD COLUMN channel_name TEXT",
    );
}
