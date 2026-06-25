import { READ_ONLY_BROWSE_TABLES } from "../scopes/manifest/index.js";
import { openScopeDb, planForTable } from "../scopes/user-scope/index.js";
import {
    buildBrowseResponse,
    clampLimit,
    clampOffset,
    executeBrowseQuery,
    type BrowseRequest,
    type BrowseResponse,
} from "./browse-shared.js";
import { introspectTable } from "./db-introspect.js";
import { userWhereOrder } from "./browse-builder.js";

function emptyResponse(plan: NonNullable<ReturnType<typeof planForTable>>): BrowseResponse {
    return {
        rows: [],
        total: 0,
        pkCols: [],
        tsCol: null,
        excludedColumns: plan.excludeColumns,
        secretColumns: [],
        canDeleteRow: false,
        canBulkDelete: false,
    };
}

interface BrowseExecArgs {
    db: ReturnType<typeof openScopeDb>;
    info: NonNullable<ReturnType<typeof introspectTable>>;
    plan: NonNullable<ReturnType<typeof planForTable>>;
    args: BrowseRequest;
}

function runUserBrowse(a: BrowseExecArgs) {
    const built = userWhereOrder(a.args, a.info, a.plan);
    return executeBrowseQuery({
        db: a.db!,
        info: a.info,
        table: a.args.table,
        where: built.where,
        whereArgs: built.baseArgs,
        orderBy: built.orderBy,
        limit: clampLimit(a.args.limit),
        offset: clampOffset(a.args.offset),
        excludeColumns: a.plan.excludeColumns,
    });
}

export function browseUserRows(siteAccountId: string, args: BrowseRequest): BrowseResponse | null {
    const db = openScopeDb(args.scope);
    if (!db) return null;
    const plan = planForTable(siteAccountId, args.scope, args.table);
    if (!plan) return null;
    if (plan.identifierValues.length === 0) return emptyResponse(plan);
    const info = introspectTable(db, args.table);
    if (!info) return null;
    const queryResult = runUserBrowse({ db, info, plan, args });
    const excluded = new Set(plan.excludeColumns);
    const readOnly = READ_ONLY_BROWSE_TABLES.has(args.table);
    return buildBrowseResponse({
        info,
        queryResult,
        excludedColumns: plan.excludeColumns,
        canDeleteRow: !readOnly && info.pkCols.length > 0 && info.pkCols.every((c) => !excluded.has(c)),
        canBulkDelete: !readOnly && info.tsCol !== null,
    });
}
