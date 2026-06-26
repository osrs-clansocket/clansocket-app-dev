import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Database } from "better-sqlite3";
import { DB_NAMES, getDb, getClanDb, clanPluginDb, pluginModes } from "../../../database/index.js";
import { clanAuditDb, clanDirPath } from "../../../database/core/database.js";
import { CLAN_AUDIT_DB_FILE, CLAN_DB_FILE } from "../../../database/core/db-constants.js";
import { SCOPE_APP, SCOPE_CLAN, SCOPE_CLAN_AUDIT, SCOPE_VAREZ, type Scope } from "./scope.js";

export { userIdFor } from "../../collect/collect-user-stats/utils.js";

function clanDbExists(clanId: string, leaf: string): boolean {
    return existsSync(resolve(clanDirPath(clanId), leaf));
}

export function openScopeDb(scope: Scope): Database | null {
    if (scope.kind === SCOPE_APP) return getDb(DB_NAMES.APP);
    if (scope.kind === SCOPE_VAREZ) return getDb(DB_NAMES.AI);
    if (scope.kind === SCOPE_CLAN) return clanDbExists(scope.clanId, CLAN_DB_FILE) ? getClanDb(scope.clanId) : null;
    if (scope.kind === SCOPE_CLAN_AUDIT) {
        return clanDbExists(scope.clanId, CLAN_AUDIT_DB_FILE) ? clanAuditDb(scope.clanId) : null;
    }
    if (!pluginModes(scope.clanId).includes(scope.mode)) return null;
    return clanPluginDb(scope.clanId, scope.mode);
}
