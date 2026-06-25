import { hashesForAccount } from "../../../database/site/site-accounts/index.js";
import { SQL_COLUMNS } from "../../../database/core/sql-columns.js";
import { quoteIdent } from "../../access/db-introspect.js";
import { APP_TABLES_BY_ACCOUNT_HASH, APP_TABLES_BY_SITE_ACCOUNT } from "../manifest/index.js";
import type { TablePlan } from "./scope.js";

interface PlanOpts {
    action?: "delete" | "null";
    excludeColumns?: readonly string[];
    browseOrder?: readonly string[];
}

export function makePlan(
    table: string,
    ownershipColumn: string,
    identifierValues: readonly string[],
    opts?: PlanOpts,
): TablePlan {
    return {
        table,
        ownershipColumn,
        identifierValues,
        action: opts?.action ?? "delete",
        excludeColumns: opts?.excludeColumns ?? [],
        browseOrder: opts?.browseOrder,
    };
}

function findEntry<T extends { table: string }>(entries: readonly T[], table: string): T | null {
    return entries.find((e) => e.table === table) ?? null;
}

interface ResolvedEntry {
    column: string;
    excludeColumns?: readonly string[];
    browseOrder?: readonly string[];
}

function resolvePlanFrom<T extends { table: string } & ResolvedEntry>(
    entries: readonly T[],
    table: string,
    identifierValues: readonly string[],
): TablePlan | null {
    const hit = findEntry(entries, table);
    return hit
        ? makePlan(table, hit.column, identifierValues, {
              excludeColumns: hit.excludeColumns,
              browseOrder: hit.browseOrder,
          })
        : null;
}

export function bySiteAccount(siteAccountId: string, table: string): TablePlan | null {
    return resolvePlanFrom(APP_TABLES_BY_SITE_ACCOUNT, table, [siteAccountId]);
}

export function appUnionPlan(siteAccountId: string, table: string): TablePlan | null {
    const hashHit = findEntry(APP_TABLES_BY_ACCOUNT_HASH, table);
    const sidHit = findEntry(APP_TABLES_BY_SITE_ACCOUNT, table);
    if (!hashHit || !sidHit) return null;
    const hashes = hashesForAccount(siteAccountId);
    const parts: string[] = [];
    const args: unknown[] = [];
    if (hashes.length > 0) {
        const ph = hashes.map(() => "?").join(", ");
        parts.push(`${quoteIdent(hashHit.column)} IN (${ph})`);
        args.push(...hashes);
    }
    parts.push(`${quoteIdent(sidHit.column)} = ?`);
    args.push(siteAccountId);
    return {
        ...makePlan(table, sidHit.column, [siteAccountId], {
            excludeColumns: hashHit.excludeColumns ?? sidHit.excludeColumns,
        }),
        customWhere: { sql: `(${parts.join(" OR ")})`, args },
    };
}

export function byAccountHash(
    siteAccountId: string,
    table: string,
    entries: readonly ({ table: string } & ResolvedEntry)[],
): TablePlan | null {
    return resolvePlanFrom(entries, table, hashesForAccount(siteAccountId));
}

export function byClanScoped(
    siteAccountId: string,
    table: string,
    entries: readonly { table: string; column: string; action: "delete" | "null" }[],
    identifierKind: typeof SQL_COLUMNS.ACCOUNT_HASH | typeof SQL_COLUMNS.SITE_ACCOUNT_ID,
): TablePlan | null {
    const hit = findEntry(entries, table);
    if (!hit) return null;
    const ids = identifierKind === SQL_COLUMNS.ACCOUNT_HASH ? hashesForAccount(siteAccountId) : [siteAccountId];
    return makePlan(table, hit.column, ids, { action: hit.action });
}
