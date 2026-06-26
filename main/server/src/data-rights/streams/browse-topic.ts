import { browseManagerRows, browseUserRows } from "../access/browse.js";
import type { BrowseRequest } from "../access/browse-shared.js";
import { isClanManager } from "../../database/clans/access/clan-manager-store.js";
import { scopeKeyClan, auditScopeKey, scopeKeyPlugin } from "./writes-stream.js";
import { SCOPE_CLAN, SCOPE_CLAN_AUDIT, SCOPE_PLUGIN, type Scope } from "../scopes/user-scope/index.js";
import { defineTopic } from "./subscriber-projection.js";
import type { ProjectionTopic } from "./projection-types.js";

export interface BrowseTopicParams {
    scope: Scope;
    table: string;
    from?: number;
    to?: number;
    rsn?: string;
    limit?: number;
    offset?: number;
    managerView?: boolean;
}

function scopeKeyOf(scope: Scope): string {
    if (scope.kind === SCOPE_CLAN && scope.clanId) return scopeKeyClan(scope.clanId);
    if (scope.kind === SCOPE_CLAN_AUDIT && scope.clanId) return auditScopeKey(scope.clanId);
    if (scope.kind === SCOPE_PLUGIN && scope.clanId && scope.mode) return scopeKeyPlugin(scope.clanId, scope.mode);
    return scope.kind;
}

function pkKeyOf(row: Record<string, unknown>, pkCols: string[]): string {
    if (pkCols.length === 0) return JSON.stringify(row);
    return pkCols.map((c) => String(row[c] ?? "")).join("|");
}

function clanIdOf(scope: Scope): string | null {
    if (scope.kind === SCOPE_CLAN || scope.kind === SCOPE_CLAN_AUDIT || scope.kind === SCOPE_PLUGIN) {
        return scope.clanId;
    }
    return null;
}

export function browseTopic(siteAccountId: string, params: BrowseTopicParams): ProjectionTopic {
    let pkCols: string[] = [];
    const clanId = clanIdOf(params.scope);
    const useManagerMode = params.managerView === true && clanId !== null && isClanManager(siteAccountId, clanId);
    return defineTopic({
        triggers: [{ scopeKey: scopeKeyOf(params.scope), table: params.table }],
        query: () => {
            const { managerView, ...args } = params;
            void managerView;
            const browseArgs: BrowseRequest = args;
            const res = useManagerMode
                ? browseManagerRows(params.scope, browseArgs)
                : browseUserRows(siteAccountId, browseArgs);
            pkCols = res?.pkCols ?? [];
            return res?.rows ?? [];
        },
        keyOf: (row) => pkKeyOf(row, pkCols),
    });
}
