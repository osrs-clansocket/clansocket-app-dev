import type Database from "better-sqlite3";
import { columnExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "027-add-guild-name-to-draft-publish-queue";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => !columnExists(db, "discord_draft_publish_queue", "guild_name"),
        "ALTER TABLE discord_draft_publish_queue ADD COLUMN guild_name TEXT",
    );
}
