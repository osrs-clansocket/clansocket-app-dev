import type Database from "better-sqlite3";
import { tableExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "001-drop-discord-resource-customizations";

export function ensure(db: Database.Database): void {
    guarded(db, () => tableExists(db, "discord_resource_customizations"), "DROP TABLE discord_resource_customizations");
}
