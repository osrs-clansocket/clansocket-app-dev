import type Database from "better-sqlite3";
import { columnExists, indexExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "004-drop-setup-cols-from-discord-servers";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => indexExists(db, "idx_discord_servers_setup_pending"),
        "DROP INDEX idx_discord_servers_setup_pending",
    );
    guarded(
        db,
        () => columnExists(db, "discord_servers", "last_setup_at"),
        "ALTER TABLE discord_servers DROP COLUMN last_setup_at",
    );
    guarded(
        db,
        () => columnExists(db, "discord_servers", "setup_failure_count"),
        "ALTER TABLE discord_servers DROP COLUMN setup_failure_count",
    );
}
