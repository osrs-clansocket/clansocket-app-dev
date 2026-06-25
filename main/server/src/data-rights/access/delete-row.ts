import type { Request, Response } from "express";
import { HTTP_NOT_FOUND } from "../../shared/http/http-status.js";
import { introspectTable, placeholders, quoteIdent } from "./db-introspect.js";
import { openScopeDb, planForTable, type Scope } from "../scopes/user-scope/index.js";
import { ACTION_USER_BULK_DELETE, ACTION_USER_ROW_DELETE } from "../scopes/action-kinds.js";
import { READ_ONLY_BROWSE_TABLES } from "../scopes/manifest/index.js";
import { recordAction } from "../cooldown.js";
import { parseDeleteBody } from "./delete-body-parser.js";

export interface DeleteRowRequest {
    scope: Scope;
    table: string;
    row?: Record<string, unknown>;
    filter?: { from: number; to: number };
}

export interface DeleteRowResponse {
    ok: boolean;
    deleted: number;
    nulled: number;
}

interface ExtraWhere {
    parts: string[];
    args: unknown[];
}

function extraRowWhere(row: Record<string, unknown>, pkCols: string[]): ExtraWhere | null {
    if (pkCols.length === 0) return null;
    const parts: string[] = [];
    const args: unknown[] = [];
    for (const col of pkCols) {
        const value = row[col];
        if (value === undefined) return null;
        parts.push(` AND ${quoteIdent(col)} = ?`);
        args.push(value);
    }
    return { parts, args };
}

function extraFilterWhere(filter: { from: number; to: number }, tsCol: string | null): ExtraWhere | null {
    if (tsCol === null) return null;
    return {
        parts: [` AND ${quoteIdent(tsCol)} BETWEEN ? AND ?`],
        args: [filter.from, filter.to],
    };
}

interface RunDeleteArgs {
    db: ReturnType<typeof openScopeDb>;
    plan: NonNullable<ReturnType<typeof planForTable>>;
    tableQuoted: string;
    ownerQuoted: string;
    where: string;
    allArgs: unknown[];
}

function runDelete(a: RunDeleteArgs): { deleted: number; nulled: number } {
    let deleted = 0;
    let nulled = 0;
    a.db!.transaction(() => {
        if (a.plan.action === "null") {
            const r = a
                .db!.prepare(`UPDATE ${a.tableQuoted} SET ${a.ownerQuoted} = NULL WHERE ${a.where}`)
                .run(...a.allArgs);
            nulled = r.changes;
        } else {
            const r = a.db!.prepare(`DELETE FROM ${a.tableQuoted} WHERE ${a.where}`).run(...a.allArgs);
            deleted = r.changes;
        }
    })();
    return { deleted, nulled };
}

function resolveExtraWhere(
    args: DeleteRowRequest,
    info: { pkCols: string[]; tsCol: string | null },
): ExtraWhere | null {
    if (args.row) return extraRowWhere(args.row, info.pkCols);
    if (args.filter) return extraFilterWhere(args.filter, info.tsCol);
    return null;
}

export function deleteUserRows(siteAccountId: string, args: DeleteRowRequest): DeleteRowResponse | null {
    if (READ_ONLY_BROWSE_TABLES.has(args.table)) return null;
    const db = openScopeDb(args.scope);
    if (!db) return null;
    const plan = planForTable(siteAccountId, args.scope, args.table);
    if (!plan) return null;
    if (plan.identifierValues.length === 0) return { ok: true, deleted: 0, nulled: 0 };
    const info = introspectTable(db, args.table);
    if (!info) return null;
    const ownerQuoted = quoteIdent(plan.ownershipColumn);
    const tableQuoted = quoteIdent(args.table);
    const ownershipWhere = plan.customWhere
        ? plan.customWhere.sql
        : `${ownerQuoted} IN (${placeholders(plan.identifierValues.length)})`;
    const ownershipArgs = plan.customWhere ? [...plan.customWhere.args] : [...plan.identifierValues];
    const extra = resolveExtraWhere(args, info);
    if (extra === null) return null;
    const where = `${ownershipWhere}${extra.parts.join("")}`;
    const allArgs = [...ownershipArgs, ...extra.args];
    const counts = runDelete({ db, plan, tableQuoted, ownerQuoted, where, allArgs });
    return { ok: true, ...counts };
}

function summarizeAction(args: DeleteRowRequest, result: DeleteRowResponse): string {
    const base = { table: args.table, scope: args.scope, deleted: result.deleted, nulled: result.nulled };
    return JSON.stringify(args.row ? { ...base, row: args.row } : { ...base, filter: args.filter });
}

export function handleDelete(req: Request, res: Response, siteAccountId: string): void {
    const parsed = parseDeleteBody((req.body ?? {}) as Record<string, unknown>, res);
    if (!parsed) return;
    const result = deleteUserRows(siteAccountId, parsed);
    if (!result) {
        res.status(HTTP_NOT_FOUND).json({ error: "not_in_manifest_or_missing_pk_or_ts" });
        return;
    }
    const kind = parsed.filter ? ACTION_USER_BULK_DELETE : ACTION_USER_ROW_DELETE;
    recordAction(siteAccountId, kind, summarizeAction(parsed, result));
    res.json(result);
}
