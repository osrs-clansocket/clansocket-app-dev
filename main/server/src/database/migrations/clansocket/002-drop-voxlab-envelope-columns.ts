import type Database from "better-sqlite3";
import { columnExists, guarded } from "../../core/migrator/migration-guards.js";

export const id = "002-drop-voxlab-envelope-columns";

export function ensure(db: Database.Database): void {
    guarded(
        db,
        () => columnExists(db, "clansocket_clans", "icon_voxlab_record"),
        "UPDATE clansocket_clans SET icon_kind = 'image', icon_value = NULL WHERE icon_kind = 'voxlab'",
    );
    guarded(
        db,
        () => columnExists(db, "clansocket_clans", "icon_voxlab_record"),
        "ALTER TABLE clansocket_clans DROP COLUMN icon_voxlab_record",
    );
    guarded(
        db,
        () => columnExists(db, "clansocket_clans", "icon_voxlab_record_br"),
        "ALTER TABLE clansocket_clans DROP COLUMN icon_voxlab_record_br",
    );
    guarded(
        db,
        () => columnExists(db, "clansocket_clans", "icon_voxlab_record_version"),
        "ALTER TABLE clansocket_clans DROP COLUMN icon_voxlab_record_version",
    );
}
