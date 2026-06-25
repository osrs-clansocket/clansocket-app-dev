import type Database from "better-sqlite3";
import { tableExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "006-drop-discord-message-templates";

export function ensure(db: Database.Database): void {
    guarded(db, () => tableExists(db, "discord_message_templates"), "DROP TABLE discord_message_templates");
}
