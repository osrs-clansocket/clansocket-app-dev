import type Database from "better-sqlite3";
import { columnExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "013-add-channel-names-to-guild-settings";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => !columnExists(db, "discord_guild_settings", "system_channel_name"),
        "ALTER TABLE discord_guild_settings ADD COLUMN system_channel_name TEXT",
    );
    guarded(
        db,
        () => !columnExists(db, "discord_guild_settings", "afk_channel_name"),
        "ALTER TABLE discord_guild_settings ADD COLUMN afk_channel_name TEXT",
    );
}
