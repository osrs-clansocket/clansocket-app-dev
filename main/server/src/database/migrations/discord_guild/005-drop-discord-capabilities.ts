import type Database from "better-sqlite3";
import { tableExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "005-drop-discord-capabilities";

export function ensure(db: Database.Database): void {
    guarded(db, () => tableExists(db, "discord_capabilities"), "DROP TABLE discord_capabilities");
}
