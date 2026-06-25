import type Database from "better-sqlite3";
import { tableExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "002-drop-discord-managed-namespace";

export function ensure(db: Database.Database): void {
    guarded(db, () => tableExists(db, "discord_managed_namespace"), "DROP TABLE discord_managed_namespace");
}
