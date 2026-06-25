import type Database from "better-sqlite3";
import { columnExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "018-add-webhook-name-to-auto-hooks";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => !columnExists(db, "discord_auto_hooks", "webhook_name"),
        "ALTER TABLE discord_auto_hooks ADD COLUMN webhook_name TEXT",
    );
}
