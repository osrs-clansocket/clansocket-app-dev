import { asFiniteNumber } from "../../shared/coerce.js";
import { openScopeDb, SCOPE_CLAN, SCOPE_CLAN_AUDIT, SCOPE_PLUGIN, type Scope } from "../scopes/user-scope/index.js";
import {
    buildBrowseResponse,
    buildRsnFilter,
    clampLimit,
    clampOffset,
    executeBrowseQuery,
    type BrowseRequest,
    type BrowseResponse,
} from "./browse-shared.js";
import { introspectTable, quoteIdent } from "./db-introspect.js";

const MANAGER_TABLE_PREFIXES: Record<string, string> = {
    [SCOPE_PLUGIN]: "plugin_",
    [SCOPE_CLAN]: "clan_",
    [SCOPE_CLAN_AUDIT]: "clan_audit_",
};

interface ManagerWhere {
    clause: string;
    whereArgs: unknown[];
}

function buildManagerWhere(args: BrowseRequest, info: NonNullable<ReturnType<typeof introspectTable>>): ManagerWhere {
    const tsCol = info.tsCol ? quoteIdent(info.tsCol) : null;
    const from = asFiniteNumber(args.from);
    const to = asFiniteNumber(args.to);
    const useDateFilter = tsCol !== null && (from !== null || to !== null);
    const rsnFilter = buildRsnFilter(
        args,
        info.cols.some((c) => c.name === "rsn"),
    );
    const conditions: string[] = [];
    const whereArgs: unknown[] = [];
    if (useDateFilter) {
        conditions.push(`${tsCol} BETWEEN ? AND ?`);
        whereArgs.push(from ?? 0, to ?? Number.MAX_SAFE_INTEGER);
    }
    if (rsnFilter) {
        conditions.push(`rsn LIKE ? COLLATE NOCASE`);
        whereArgs.push(rsnFilter.arg);
    }
    return { clause: conditions.join(" AND "), whereArgs };
}

function managerOrderBy(info: NonNullable<ReturnType<typeof introspectTable>>): string {
    const tsCol = info.tsCol ? quoteIdent(info.tsCol) : null;
    const orderParts: string[] = [];
    if (tsCol !== null) orderParts.push(`${tsCol} DESC`);
    for (const c of info.pkCols) orderParts.push(`${quoteIdent(c)} DESC`);
    if (orderParts.length === 0) orderParts.push("rowid");
    return orderParts.join(", ");
}

function runManagerQuery(
    db: ReturnType<typeof openScopeDb>,
    info: NonNullable<ReturnType<typeof introspectTable>>,
    args: BrowseRequest,
) {
    const { clause: where, whereArgs } = buildManagerWhere(args, info);
    return executeBrowseQuery({
        info,
        where,
        whereArgs,
        db: db!,
        table: args.table,
        orderBy: managerOrderBy(info),
        limit: clampLimit(args.limit),
        offset: clampOffset(args.offset),
        excludeColumns: [],
    });
}

export function browseManagerRows(scope: Scope, args: BrowseRequest): BrowseResponse | null {
    const allowedPrefix = MANAGER_TABLE_PREFIXES[scope.kind];
    if (!allowedPrefix || !args.table.startsWith(allowedPrefix)) return null;
    const db = openScopeDb(scope);
    if (!db) return null;
    const info = introspectTable(db, args.table);
    if (!info) return null;
    const queryResult = runManagerQuery(db, info, args);
    return buildBrowseResponse({
        info,
        queryResult,
        excludedColumns: [],
        canDeleteRow: false,
        canBulkDelete: false,
    });
}
