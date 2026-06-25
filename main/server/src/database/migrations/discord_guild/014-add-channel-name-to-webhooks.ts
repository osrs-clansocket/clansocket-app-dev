import type Database from "better-sqlite3";
import { columnExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "014-add-channel-name-to-webhooks";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => !columnExists(db, "discord_webhooks", "channel_name"),
        "ALTER TABLE discord_webhooks ADD COLUMN channel_name TEXT",
    );
}
