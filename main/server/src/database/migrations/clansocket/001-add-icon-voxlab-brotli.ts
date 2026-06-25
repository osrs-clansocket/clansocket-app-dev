import type Database from "better-sqlite3";
import { columnExists, guarded } from "../../core/migrator/migration-guards.js";

export const id = "001-add-icon-voxlab-brotli";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => !columnExists(db, "clansocket_clans", "icon_voxlab_record_br"),
        "ALTER TABLE clansocket_clans ADD COLUMN icon_voxlab_record_br BLOB",
    );
    guarded(
        db,
        () => !columnExists(db, "clansocket_clans", "icon_voxlab_record_version"),
        "ALTER TABLE clansocket_clans ADD COLUMN icon_voxlab_record_version TEXT",
    );
}
