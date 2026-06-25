import type Database from "better-sqlite3";
import { tableExists } from "../../core/migrator/migration-guards.js";
import { guarded } from "../../core/migrator/migration-guards.js";

export const id = "001-drop-clan-invite-redemptions";

export function ensure(db: Database.Database): void {
    guarded(db, () => tableExists(db, "clan_invite_redemptions"), "DROP TABLE clan_invite_redemptions");
}
