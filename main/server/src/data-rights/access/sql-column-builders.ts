import type { ColumnInfo } from "./db-introspection-types.js";

export function buildSizeExpr(cols: ColumnInfo[]): string {
    return cols.map((c) => `coalesce(length(cast(${c.nameQuoted} as blob)), 0)`).join(" + ");
}

export function projectionColumns(cols: ColumnInfo[], excludeColumns: readonly string[] = []): string {
    const exclude = new Set(excludeColumns);
    return cols
        .filter((c) => !exclude.has(c.name))
        .map((c) => c.nameQuoted)
        .join(", ");
}
