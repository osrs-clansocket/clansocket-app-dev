import type Database from "better-sqlite3";
import { tableExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "002-drop-clan-invites";

export function ensure(db: Database.Database): void {
    guarded(db, () => tableExists(db, "clan_invites"), "DROP TABLE clan_invites");
}
