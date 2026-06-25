import { hashesForAccount } from "../../../database/site/site-accounts/index.js";
import {
    CLAN_AUDIT_DB_SITE_ACCOUNT_TABLES,
    CLAN_DB_SITE_ACCOUNT_TABLES,
    CLAN_DB_USER_TABLES,
    PLUGIN_USER_TABLES,
    VAREZ_TABLES_BY_SITE_ACCOUNT,
} from "../manifest/index.js";
import { SCOPE_APP, SCOPE_CLAN, SCOPE_CLAN_AUDIT, SCOPE_PLUGIN, SCOPE_VAREZ, type Scope } from "../user-scope/index.js";
import { clansUserPresence } from "./clan-presence.js";
import type { ClanPresence } from "./types.js";
import { appTables, buildTableList, hasUserRows } from "./table-presence.js";
import type { ScopeListItem } from "./types.js";

export type { ScopeListItem, ScopeListTable } from "./types.js";
export { canSeeScope, scopeScopeKey } from "./scope-key.js";
export { hasUserRows };

function baseScopes(siteAccountId: string): ScopeListItem[] {
    const appScope: Scope = { kind: SCOPE_APP };
    const varezScope: Scope = { kind: SCOPE_VAREZ };
    return [
        { kind: SCOPE_APP, label: "Account", tables: buildTableList(siteAccountId, appScope, appTables()) },
        {
            kind: SCOPE_VAREZ,
            label: "AI history",
            tables: buildTableList(
                siteAccountId,
                varezScope,
                VAREZ_TABLES_BY_SITE_ACCOUNT.map((e) => e.table),
            ),
        },
    ];
}

interface ClanScopeArgs {
    siteAccountId: string;
    scope: Scope;
    label: string;
    presence: ClanPresence;
    tables: string[];
    mode?: string;
}

function buildClanScope(args: ClanScopeArgs): ScopeListItem {
    return {
        ...(args.mode !== undefined && { mode: args.mode }),
        kind: args.scope.kind,
        label: args.label,
        clanId: args.presence.clan.id,
        clanSlug: args.presence.clan.slug,
        tables: buildTableList(args.siteAccountId, args.scope, args.tables),
    };
}

function clanDbScope(siteAccountId: string, presence: ClanPresence): ScopeListItem {
    return buildClanScope({
        siteAccountId,
        presence,
        scope: { kind: SCOPE_CLAN, clanId: presence.clan.id },
        label: `Clan · ${presence.clan.display_name}`,
        tables: [...CLAN_DB_USER_TABLES.map((e) => e.table), ...CLAN_DB_SITE_ACCOUNT_TABLES.map((e) => e.table)],
    });
}

function clanAuditScope(siteAccountId: string, presence: ClanPresence): ScopeListItem {
    return buildClanScope({
        siteAccountId,
        presence,
        scope: { kind: SCOPE_CLAN_AUDIT, clanId: presence.clan.id },
        label: `Audit · ${presence.clan.display_name}`,
        tables: CLAN_AUDIT_DB_SITE_ACCOUNT_TABLES.map((e) => e.table),
    });
}

function pluginScope(siteAccountId: string, presence: ClanPresence, mode: string): ScopeListItem {
    return buildClanScope({
        siteAccountId,
        presence,
        mode,
        scope: { kind: SCOPE_PLUGIN, clanId: presence.clan.id, mode },
        label: `Plugin · ${presence.clan.display_name} · ${mode}`,
        tables: PLUGIN_USER_TABLES.map((e) => e.table),
    });
}

function pushClanScopes(scopes: ScopeListItem[], siteAccountId: string, presence: ClanPresence): void {
    if (presence.hasClanDb) scopes.push(clanDbScope(siteAccountId, presence));
    if (presence.hasAuditDb) scopes.push(clanAuditScope(siteAccountId, presence));
    for (const mode of presence.presentModes) scopes.push(pluginScope(siteAccountId, presence, mode));
}

export function listUserScopes(siteAccountId: string): ScopeListItem[] {
    const scopes = baseScopes(siteAccountId);
    const hashes = hashesForAccount(siteAccountId);
    for (const presence of clansUserPresence(siteAccountId, hashes)) {
        pushClanScopes(scopes, siteAccountId, presence);
    }
    return scopes;
}
