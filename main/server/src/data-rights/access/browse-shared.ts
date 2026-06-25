import type Database from "better-sqlite3";
import { asFiniteNumber } from "../../shared/coerce.js";
import { GLOBAL_SECRET_COLUMNS } from "../scopes/manifest/index.js";
import type { Scope } from "../scopes/user-scope/index.js";
import { introspectTable, projectionColumns, quoteIdent } from "./db-introspect.js";

const MAX_LIMIT = 200;
const DEFAULT_LIMIT = 50;

export interface BrowseRequest {
    scope: Scope;
    table: string;
    from?: number;
    to?: number;
    rsn?: string;
    limit?: number;
    offset?: number;
}

export interface BrowseResponse {
    rows: Record<string, unknown>[];
    total: number;
    pkCols: string[];
    tsCol: string | null;
    excludedColumns: readonly string[];
    secretColumns: readonly string[];
    canDeleteRow: boolean;
    canBulkDelete: boolean;
}

export function buildRsnFilter(args: BrowseRequest, hasRsnColumn: boolean): { sql: string; arg: string } | null {
    if (!hasRsnColumn) return null;
    if (typeof args.rsn !== "string") return null;
    const trimmed = args.rsn.trim();
    if (trimmed.length === 0) return null;
    return { sql: ` AND rsn LIKE ? COLLATE NOCASE`, arg: `%${trimmed}%` };
}

function clamp(n: number, min: number, max: number): number {
    if (n < min) return min;
    if (n > max) return max;
    return n;
}

export function clampLimit(raw: unknown): number {
    const n = asFiniteNumber(raw);
    return clamp(n !== null ? Math.floor(n) : DEFAULT_LIMIT, 1, MAX_LIMIT);
}

export function clampOffset(raw: unknown): number {
    const n = asFiniteNumber(raw);
    return Math.max(0, n !== null ? Math.floor(n) : 0);
}

export interface BrowseQuery {
    db: Database.Database;
    info: NonNullable<ReturnType<typeof introspectTable>>;
    table: string;
    where: string;
    whereArgs: unknown[];
    orderBy: string;
    limit: number;
    offset: number;
    excludeColumns: readonly string[];
}

export interface BrowseRows {
    rows: Record<string, unknown>[];
    total: number;
    secretColumns: string[];
}

export interface BrowseResponseArgs {
    info: { pkCols: string[]; tsCol: string | null };
    queryResult: BrowseRows;
    excludedColumns: readonly string[];
    canDeleteRow: boolean;
    canBulkDelete: boolean;
}

export function buildBrowseResponse(a: BrowseResponseArgs): BrowseResponse {
    return {
        rows: a.queryResult.rows,
        secretColumns: a.queryResult.secretColumns,
        total: a.queryResult.total,
        pkCols: a.info.pkCols,
        tsCol: a.info.tsCol,
        excludedColumns: a.excludedColumns,
        canDeleteRow: a.canDeleteRow,
        canBulkDelete: a.canBulkDelete,
    };
}

export function executeBrowseQuery(q: BrowseQuery): BrowseRows {
    const tableQuoted = quoteIdent(q.table);
    const whereClause = q.where.length > 0 ? `WHERE ${q.where}` : "";
    const total = (
        q.db.prepare(`SELECT COUNT(*) AS n FROM ${tableQuoted} ${whereClause}`).get(...q.whereArgs) as { n: number }
    ).n;
    const proj = projectionColumns(q.info.cols, q.excludeColumns);
    const rows = q.db
        .prepare(`SELECT ${proj} FROM ${tableQuoted} ${whereClause} ORDER BY ${q.orderBy} LIMIT ? OFFSET ?`)
        .all(...q.whereArgs, q.limit, q.offset) as Record<string, unknown>[];
    const secretColumns = q.info.cols.map((c) => c.name).filter((c) => GLOBAL_SECRET_COLUMNS.includes(c));
    return { rows, secretColumns, total: Number(total) || 0 };
}
