export function pkKeyOf(row: Record<string, unknown>, pkCols: readonly string[]): string {
    return pkCols.map((c) => String(row[c] ?? "")).join("|");
}
