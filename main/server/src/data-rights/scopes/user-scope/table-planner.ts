import {
    APP_TABLES_BY_ACCOUNT_HASH,
    CLAN_AUDIT_DB_SITE_ACCOUNT_TABLES,
    CLAN_DB_SITE_ACCOUNT_TABLES,
    CLAN_DB_USER_TABLES,
    PLUGIN_USER_TABLES,
    VAREZ_TABLES_BY_SITE_ACCOUNT,
} from "../manifest/index.js";
import { appUnionPlan, byAccountHash, byClanScoped, bySiteAccount, makePlan } from "./plan-resolver.js";
import { SQL_COLUMNS } from "../../../database/core/sql-columns.js";
import {
    SCOPE_APP,
    SCOPE_CLAN,
    SCOPE_CLAN_AUDIT,
    SCOPE_CLAN_FLOWS,
    SCOPE_VAREZ,
    type Scope,
    type TablePlan,
} from "./scope.js";

export function planForTable(siteAccountId: string, scope: Scope, table: string): TablePlan | null {
    if (scope.kind === SCOPE_APP) {
        return (
            appUnionPlan(siteAccountId, table) ??
            byAccountHash(siteAccountId, table, APP_TABLES_BY_ACCOUNT_HASH) ??
            bySiteAccount(siteAccountId, table)
        );
    }
    if (scope.kind === SCOPE_VAREZ) {
        const hit = VAREZ_TABLES_BY_SITE_ACCOUNT.find((e) => e.table === table);
        return hit ? makePlan(table, hit.column, [siteAccountId]) : null;
    }
    if (scope.kind === SCOPE_CLAN) {
        return (
            byClanScoped(siteAccountId, table, CLAN_DB_USER_TABLES, SQL_COLUMNS.ACCOUNT_HASH) ??
            byClanScoped(siteAccountId, table, CLAN_DB_SITE_ACCOUNT_TABLES, SQL_COLUMNS.SITE_ACCOUNT_ID)
        );
    }
    if (scope.kind === SCOPE_CLAN_AUDIT) {
        return byClanScoped(siteAccountId, table, CLAN_AUDIT_DB_SITE_ACCOUNT_TABLES, SQL_COLUMNS.SITE_ACCOUNT_ID);
    }
    if (scope.kind === SCOPE_CLAN_FLOWS) {
        return null;
    }
    return byAccountHash(siteAccountId, table, PLUGIN_USER_TABLES);
}
