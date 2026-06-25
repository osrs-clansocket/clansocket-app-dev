import type { Database } from "better-sqlite3";
import { type TableIntrospection } from "./db-introspection-types.js";
import { quoteIdent } from "./sql-quoter.js";
import { pickTsColumn } from "./ts-column-picker.js";

const introspectionCache = new WeakMap<Database, Map<string, TableIntrospection | null>>();

function buildIntrospection(db: Database, table: string): TableIntrospection | null {
    const rows = db.prepare(`PRAGMA table_info(${quoteIdent(table)})`).all() as Array<{ name: string; pk: number }>;
    if (rows.length === 0) return null;
    const cols = rows.map((r) => ({ name: r.name, nameQuoted: quoteIdent(r.name), pkOrder: r.pk }));
    const pkCols = cols
        .filter((c) => c.pkOrder > 0)
        .sort((a, b) => a.pkOrder - b.pkOrder)
        .map((c) => c.name);
    return { cols, pkCols, tsCol: pickTsColumn(cols) };
}

export function introspectTable(db: Database, table: string): TableIntrospection | null {
    let cache = introspectionCache.get(db);
    if (!cache) {
        cache = new Map();
        introspectionCache.set(db, cache);
    }
    if (cache.has(table)) return cache.get(table) ?? null;
    const info = buildIntrospection(db, table);
    cache.set(table, info);
    return info;
}

export type { ColumnInfo, TableIntrospection } from "./db-introspection-types.js";
export { quoteIdent, placeholders, buildSizeExpr, projectionColumns } from "./sql-quoter.js";
export { normalizeTs } from "./ts-normalizer.js";
