import { DB_NAMES, getDb } from "../../core/database.js";
import type { RunewatchCaseRow, RunewatchTier } from "./lookup-by-rsn.js";

const SELECT_BASE = `SELECT case_key, hash, tier, accused_rsn, rsn_normalized, reason,
                            evidence_rating, source, quick_find, published_at, synced_at
                     FROM clansocket_runewatch_cases`;

export interface ListCasesParams {
    tier?: RunewatchTier;
    rsnLike?: string;
    limit?: number;
    offset?: number;
}

const NO_LIMIT = -1;

export function listRunewatchCases(params: ListCasesParams = {}): RunewatchCaseRow[] {
    const where: string[] = [];
    const args: unknown[] = [];
    if (params.tier) {
        where.push("tier = ?");
        args.push(params.tier);
    }
    if (params.rsnLike) {
        where.push("rsn_normalized LIKE ?");
        args.push(`%${params.rsnLike.toLowerCase()}%`);
    }
    const whereSql = where.length > 0 ? ` WHERE ${where.join(" AND ")}` : "";
    const orderSql = "ORDER BY tier ASC, published_at DESC NULLS LAST";
    const offset = params.offset ?? 0;
    const limit = params.limit ?? NO_LIMIT;
    const limitSql = `LIMIT ${limit} OFFSET ${offset}`;
    const sql = `${SELECT_BASE}${whereSql} ${orderSql} ${limitSql}`;
    return getDb(DB_NAMES.APP)
        .prepare(sql)
        .all(...args) as RunewatchCaseRow[];
}
