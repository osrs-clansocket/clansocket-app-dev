import type Database from "better-sqlite3";
import { tableExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "003-drop-discord-preset-resources";

export function ensure(db: Database.Database): void {
    guarded(db, () => tableExists(db, "discord_preset_resources"), "DROP TABLE discord_preset_resources");
}
