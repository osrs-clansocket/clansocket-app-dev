export function buildInsertSql(table: string, specificCols: readonly string[]): string {
    const placeholders = specificCols.map(() => "?").join(", ");
    const colList = specificCols.join(", ");
    return `INSERT INTO ${table}
            (account_hash, rsn, session_id, session_seq, event_received_at,
             plugin_version, ${colList},
             world, x, y, plane, region_id, region_name, area, dedup_hash)
         VALUES (?, ?, ?, ?, ?, ?, ${placeholders}, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(dedup_hash) DO NOTHING`;
}
