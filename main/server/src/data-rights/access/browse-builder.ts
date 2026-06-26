import { planForTable } from "../scopes/user-scope/index.js";
import { buildRsnFilter, type BrowseRequest } from "./browse-shared.js";
import { composeTsClause } from "./composer-ts-clause.js";
import { introspectTable, placeholders, quoteIdent } from "./db-introspect.js";

export interface UserBrowseBuilt {
    where: string;
    baseArgs: unknown[];
    orderBy: string;
}

export function userOrderBy(
    info: NonNullable<ReturnType<typeof introspectTable>>,
    plan: NonNullable<ReturnType<typeof planForTable>>,
    ownerQuoted: string,
): string {
    const tsCol = info.tsCol ? quoteIdent(info.tsCol) : null;
    const colNames = new Set(info.cols.map((c) => c.name));
    const browseOrder = (plan.browseOrder ?? []).filter((c) => colNames.has(c));
    const orderParts: string[] = [];
    if (browseOrder.length > 0) {
        for (const c of browseOrder) orderParts.push(`${quoteIdent(c)} ASC`);
    } else {
        if (tsCol !== null) orderParts.push(`${tsCol} DESC`);
        for (const c of info.pkCols) orderParts.push(`${quoteIdent(c)} DESC`);
    }
    if (orderParts.length === 0) orderParts.push(ownerQuoted);
    return orderParts.join(", ");
}

export function userWhereOrder(
    args: BrowseRequest,
    info: NonNullable<ReturnType<typeof introspectTable>>,
    plan: NonNullable<ReturnType<typeof planForTable>>,
): UserBrowseBuilt {
    const ownerQuoted = quoteIdent(plan.ownershipColumn);
    const ts = composeTsClause(args, info);
    const rsnFilter = buildRsnFilter(
        args,
        info.cols.some((c) => c.name === "rsn"),
    );
    const ownershipWhere = plan.customWhere
        ? plan.customWhere.sql
        : `${ownerQuoted} IN (${placeholders(plan.identifierValues.length)})`;
    const ownershipArgs = plan.customWhere ? [...plan.customWhere.args] : [...plan.identifierValues];
    return {
        where: `${ownershipWhere}${ts.sql}${rsnFilter ? rsnFilter.sql : ""}`,
        baseArgs: [...ownershipArgs, ...ts.args, ...(rsnFilter ? [rsnFilter.arg] : [])],
        orderBy: userOrderBy(info, plan, ownerQuoted),
    };
}
