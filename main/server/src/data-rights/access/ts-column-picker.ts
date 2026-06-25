import { TS_PROBE_COLUMNS, type ColumnInfo } from "./db-introspection-types.js";

export function pickTsColumn(cols: ColumnInfo[]): string | null {
    const names = new Set(cols.map((c) => c.name));
    for (const probe of TS_PROBE_COLUMNS) {
        if (names.has(probe)) return probe;
    }
    return null;
}
