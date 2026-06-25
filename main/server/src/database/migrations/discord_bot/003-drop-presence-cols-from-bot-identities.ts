import type Database from "better-sqlite3";
import { columnExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "003-drop-presence-cols-from-bot-identities";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => columnExists(db, "discord_bot_identities", "presence_config_json"),
        "ALTER TABLE discord_bot_identities DROP COLUMN presence_config_json",
    );
    guarded(
        db,
        () => columnExists(db, "discord_bot_identities", "presence_set_at"),
        "ALTER TABLE discord_bot_identities DROP COLUMN presence_set_at",
    );
}
