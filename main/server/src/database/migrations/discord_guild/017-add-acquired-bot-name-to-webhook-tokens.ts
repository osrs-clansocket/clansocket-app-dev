import type Database from "better-sqlite3";
import { columnExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "017-add-acquired-bot-name-to-webhook-tokens";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => !columnExists(db, "discord_webhook_tokens", "acquired_by_bot_name"),
        "ALTER TABLE discord_webhook_tokens ADD COLUMN acquired_by_bot_name TEXT",
    );
}
