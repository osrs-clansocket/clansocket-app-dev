import { getDb, DB_NAMES } from "../../../../database/index.js";

import { sqlReferencesAllowed } from "../read-only.js";
import { CHAIN_DB, CHAIN_VIEW, queryResult, truncateRows, type QueryResult } from "../types.js";

const CHAIN_VIEW_SQL = `CREATE TEMP VIEW ${CHAIN_VIEW} AS
 SELECT chain_id, step, mode, loaded_context, reads, queries, recap, started_at, completed_at
 FROM varez_chain_turns
 WHERE site_account_id = ?`;

function gateChainSql(siteAccountId: string | undefined, sql: string): QueryResult | null {
    if (typeof siteAccountId !== "string" || siteAccountId.length === 0) {
        return queryResult({
            sql,
            db: CHAIN_DB,
            rows: [],
            error: "chain queries require an authenticated site account",
        });
    }
    const guard = sqlReferencesAllowed(sql);
    if (!guard.ok) {
        return queryResult({
            sql,
            db: CHAIN_DB,
            rows: [],
            error: `chain db only exposes the '${CHAIN_VIEW}' view. blocked table reference: '${guard.offending}'`,
        });
    }
    return null;
}

export function executeChainQuery(siteAccountId: string | undefined, sql: string): QueryResult {
    const error = gateChainSql(siteAccountId, sql);
    if (error !== null) return error;
    try {
        const db = getDb(DB_NAMES.AI);
        db.exec(`DROP VIEW IF EXISTS ${CHAIN_VIEW}`);
        db.prepare(CHAIN_VIEW_SQL).run(siteAccountId!);
        const { limited, truncated } = truncateRows(db.prepare(sql).all() as Record<string, unknown>[]);
        return queryResult({ sql, db: CHAIN_DB, rows: limited, error: truncated });
    } catch (err) {
        return queryResult({ sql, db: CHAIN_DB, rows: [], error: (err as Error).message });
    }
}
