import { executeQueries, formatResults } from "../../../queries/db-query/index.js";
import type { ChainEvent } from "../types.js";

interface DbQuery {
    db: string;
    sql: string;
    clan?: string;
}

export interface ExecutedQueryMeta {
    db: string;
    sql: string;
    rows: number | null;
    error?: string;
}

export interface RunChainQueries {
    queries: DbQuery[];
    siteAccountId: string;
    injections: string[];
    events: ChainEvent[];
    modeOverrides?: Record<string, boolean>;
}

export function runChainQueries(args: RunChainQueries): ExecutedQueryMeta[] {
    const { queries, siteAccountId, injections, events, modeOverrides = {} } = args;
    const executedQueries: ExecutedQueryMeta[] = [];
    if (queries.length === 0) return executedQueries;
    if (modeOverrides.mode_db_queries === false) {
        injections.push("[DB QUERY RESULTS]\nSkipped: DB queries are disabled in Modes settings.");
        return executedQueries;
    }
    const results = executeQueries(queries, { siteAccountId });
    injections.push(`[DB QUERY RESULTS]\n${formatResults(results)}`);
    for (const r of results) {
        events.push({
            type: "query",
            payload: { db: r.db, sql: r.sql, rows: r.rows.length, error: r.error, data: r.rows },
        });
        executedQueries.push({
            db: r.db,
            sql: r.sql,
            rows: r.rows.length,
            error: r.error ?? undefined,
        });
    }
    return executedQueries;
}
