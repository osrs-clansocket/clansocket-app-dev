import type Database from "better-sqlite3";
import { columnExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "022-add-guild-name-to-channel-member-overwrites";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => !columnExists(db, "discord_channel_member_overwrites", "guild_name"),
        "ALTER TABLE discord_channel_member_overwrites ADD COLUMN guild_name TEXT",
    );
}
