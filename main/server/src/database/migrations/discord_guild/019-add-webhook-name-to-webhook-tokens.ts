import type Database from "better-sqlite3";
import { columnExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "019-add-webhook-name-to-webhook-tokens";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => !columnExists(db, "discord_webhook_tokens", "webhook_name"),
        "ALTER TABLE discord_webhook_tokens ADD COLUMN webhook_name TEXT",
    );
}
