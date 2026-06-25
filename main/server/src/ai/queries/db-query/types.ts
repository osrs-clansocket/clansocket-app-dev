export const CHAIN_DB = "chain";
export const CLAN_DB = "clan";
export const CHAIN_VIEW = "chain_steps";
export const MAX_ROWS = 50;

export interface QueryResult {
    db: string;
    sql: string;
    clan?: string;
    rows: Record<string, unknown>[];
    error: string | null;
}

export interface QueryResultInput {
    db: string;
    sql: string;
    rows: Record<string, unknown>[];
    error: string | null;
    clan?: string;
}

export function queryResult(input: QueryResultInput): QueryResult {
    const { db, sql, rows, error, clan } = input;
    return clan !== undefined ? { db, sql, clan, rows, error } : { db, sql, rows, error };
}

export interface TruncatedRows {
    limited: Record<string, unknown>[];
    truncated: string | null;
}

export function truncateRows(rows: Record<string, unknown>[]): TruncatedRows {
    const limited = rows.slice(0, MAX_ROWS);
    const truncated = rows.length > MAX_ROWS ? `Results truncated to ${MAX_ROWS} rows (${rows.length} total)` : null;
    return { limited, truncated };
}

export interface QueryContext {
    siteAccountId: string;
}
