import type Database from "better-sqlite3";
import { columnExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "007-add-guild-name-to-outbound-events";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => !columnExists(db, "discord_outbound_events", "guild_name"),
        "ALTER TABLE discord_outbound_events ADD COLUMN guild_name TEXT",
    );
}
