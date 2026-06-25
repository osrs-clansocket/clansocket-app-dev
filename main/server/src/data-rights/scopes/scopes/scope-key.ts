import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pluginModes } from "../../../database/index.js";
import { clanDirPath } from "../../../database/core/database.js";
import { CLAN_AUDIT_DB_FILE, CLAN_DB_FILE } from "../../../database/core/db-constants.js";
import { hashesForAccount } from "../../../database/site/site-accounts/index.js";
import { SCOPE_CLAN, SCOPE_CLAN_AUDIT, SCOPE_PLUGIN } from "../user-scope/index.js";
import { hasPluginRows, touchesAudit, touchesClan } from "./clan-presence.js";
import { isSimpleScope, scopeScopeKey } from "./scope-parser.js";

export { scopeScopeKey } from "./scope-parser.js";

export function canSeeScope(siteAccountId: string, scopeKey: string): boolean {
    const scope = scopeScopeKey(scopeKey);
    if (scope === null) return false;
    if (isSimpleScope(scope.kind)) return true;
    const hashes = hashesForAccount(siteAccountId);
    if (scope.kind === SCOPE_CLAN) {
        if (!existsSync(resolve(clanDirPath(scope.clanId), CLAN_DB_FILE))) return false;
        return touchesClan(scope.clanId, siteAccountId, hashes);
    }
    if (scope.kind === SCOPE_CLAN_AUDIT) {
        if (!existsSync(resolve(clanDirPath(scope.clanId), CLAN_AUDIT_DB_FILE))) return false;
        return touchesAudit(scope.clanId, siteAccountId);
    }
    if (scope.kind === SCOPE_PLUGIN) {
        if (!pluginModes(scope.clanId).includes(scope.mode)) return false;
        return hasPluginRows(scope.clanId, scope.mode, hashes);
    }
    return false;
}
