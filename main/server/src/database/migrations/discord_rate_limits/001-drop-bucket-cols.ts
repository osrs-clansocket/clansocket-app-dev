import type Database from "better-sqlite3";
import { columnExists, indexExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "001-drop-bucket-cols";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => indexExists(db, "idx_discord_rate_limit_buckets_hash"),
        "DROP INDEX idx_discord_rate_limit_buckets_hash",
    );
    guarded(
        db,
        () => columnExists(db, "discord_rate_limit_buckets", "bucket_hash"),
        "ALTER TABLE discord_rate_limit_buckets DROP COLUMN bucket_hash",
    );
    guarded(
        db,
        () => columnExists(db, "discord_rate_limit_buckets", "last_429_at"),
        "ALTER TABLE discord_rate_limit_buckets DROP COLUMN last_429_at",
    );
}
