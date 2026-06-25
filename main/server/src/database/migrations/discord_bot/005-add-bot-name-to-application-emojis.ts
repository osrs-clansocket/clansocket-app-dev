import type Database from "better-sqlite3";
import { columnExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "005-add-bot-name-to-application-emojis";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => !columnExists(db, "discord_application_emojis", "bot_name"),
        "ALTER TABLE discord_application_emojis ADD COLUMN bot_name TEXT",
    );
}
