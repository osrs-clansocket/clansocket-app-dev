import type { Database } from "better-sqlite3";
import { buildSizeExpr, introspectTable, normalizeTs, quoteIdent } from "../../access/db-introspect.js";
import { ownedMembers, ownedDiffs, type OwnedRsnWindow } from "../../temporal-correlation.js";
import { ZERO, tableStat, type TableStat } from "./types.js";

function tsToMs(name: string): string {
    if (name === "minute_bucket") return `${quoteIdent(name)} * 60000`;
    return quoteIdent(name);
}

export function statOne(db: Database, table: string, column: string, value: string): TableStat {
    const info = introspectTable(db, table);
    if (!info) return ZERO;
    const sizeExpr = buildSizeExpr(info.cols);
    const tsSelect = info.tsCol ? `, MIN(${tsToMs(info.tsCol)}) AS min_ts` : "";
    const sql = `SELECT COUNT(*) AS r, COALESCE(SUM(${sizeExpr}), 0) AS b${tsSelect} FROM ${quoteIdent(table)} WHERE ${quoteIdent(column)} = ?`;
    const row = db.prepare(sql).get(value) as { r: number; b: number; min_ts?: number | null };
    return tableStat(Number(row.r) || 0, Number(row.b) || 0, info.tsCol ? normalizeTs(row.min_ts ?? null) : null);
}

export interface ChildJoinedArgs {
    db: Database;
    childTable: string;
    childParentKey: string;
    parentTable: string;
    parentKey: string;
    parentFilterColumn: string;
    value: string;
}

export function statChildJoined(args: ChildJoinedArgs): TableStat {
    const { db, childTable, childParentKey, parentTable, parentKey, parentFilterColumn, value } = args;
    const childInfo = introspectTable(db, childTable);
    const parentInfo = introspectTable(db, parentTable);
    if (!childInfo || !parentInfo) return ZERO;
    const sizeExpr = childInfo.cols.map((c) => `coalesce(length(cast(c.${c.nameQuoted} as blob)), 0)`).join(" + ");
    const sql =
        `SELECT COUNT(*) AS r, COALESCE(SUM(${sizeExpr}), 0) AS b ` +
        `FROM ${quoteIdent(childTable)} AS c ` +
        `JOIN ${quoteIdent(parentTable)} AS p ON p.${quoteIdent(parentKey)} = c.${quoteIdent(childParentKey)} ` +
        `WHERE p.${quoteIdent(parentFilterColumn)} = ?`;
    const row = db.prepare(sql).get(value) as { r: number; b: number };
    return tableStat(Number(row.r) || 0, Number(row.b) || 0);
}

function jsonBytes(row: Record<string, unknown>): number {
    return JSON.stringify(row).length;
}

function statTemporal<T extends Record<string, unknown>>(rows: T[], tsField: keyof T): TableStat {
    if (rows.length === 0) return ZERO;
    let bytes = 0;
    let minTs: number | null = null;
    for (const r of rows) {
        bytes += jsonBytes(r);
        const ts = r[tsField] as number;
        if (minTs === null || ts < minTs) minTs = ts;
    }
    return tableStat(rows.length, bytes, normalizeTs(minTs));
}

export const statTemporalMembers = (clanId: string, windows: OwnedRsnWindow[]): TableStat =>
    statTemporal(ownedMembers(clanId, windows) as unknown as Record<string, unknown>[], "first_observed_at");

export const statTemporalDiffs = (clanId: string, windows: OwnedRsnWindow[]): TableStat =>
    statTemporal(ownedDiffs(clanId, windows) as unknown as Record<string, unknown>[], "detected_at");
