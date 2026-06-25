export function stripBlobs(rows: Record<string, unknown>[], blobColumns: readonly string[]): Record<string, unknown>[] {
    if (blobColumns.length === 0) return rows;
    const blocked = new Set(blobColumns);
    return rows.map((row) => Object.fromEntries(Object.entries(row).filter(([k]) => !blocked.has(k))));
}
