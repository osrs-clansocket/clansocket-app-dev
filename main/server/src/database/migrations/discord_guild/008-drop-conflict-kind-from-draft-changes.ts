import type Database from "better-sqlite3";
import { columnExists, indexExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "008-drop-conflict-kind-from-draft-changes";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => indexExists(db, "idx_discord_draft_changes_conflicts"),
        "DROP INDEX idx_discord_draft_changes_conflicts",
    );
    guarded(
        db,
        () => columnExists(db, "discord_draft_changes", "conflict_kind"),
        "ALTER TABLE discord_draft_changes DROP COLUMN conflict_kind",
    );
}
