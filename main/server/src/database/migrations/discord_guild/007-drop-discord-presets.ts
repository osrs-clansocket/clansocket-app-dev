import type Database from "better-sqlite3";
import { tableExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "007-drop-discord-presets";

export function ensure(db: Database.Database): void {
    guarded(db, () => tableExists(db, "discord_presets"), "DROP TABLE discord_presets");
}
