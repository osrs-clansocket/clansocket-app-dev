import type { Response } from "express";
import { HTTP_BAD_REQUEST } from "../../shared/http/http-status.js";
import { isNonBlank, isPlainObject } from "../../shared/validators/type-guards.js";
import { parseScope, type Scope } from "../scopes/user-scope/index.js";

export interface ParsedDeleteBody {
    scope: Scope;
    table: string;
    row?: Record<string, unknown>;
    filter?: { from: number; to: number };
}

function parseFilter(body: Record<string, unknown>): { from: number; to: number } | undefined {
    const filterRaw = body.filter as { from?: unknown; to?: unknown } | undefined;
    if (filterRaw && typeof filterRaw.from === "number" && typeof filterRaw.to === "number") {
        return { from: filterRaw.from, to: filterRaw.to };
    }
    return undefined;
}

export function parseDeleteBody(body: Record<string, unknown>, res: Response): ParsedDeleteBody | null {
    if (body.managerView === true) {
        res.status(HTTP_BAD_REQUEST).json({ error: "manager_view_is_read_only" });
        return null;
    }
    const scope = parseScope(body.scope);
    if (!scope) {
        res.status(HTTP_BAD_REQUEST).json({ error: "bad_scope" });
        return null;
    }
    const table = body.table;
    if (!isNonBlank(table)) {
        res.status(HTTP_BAD_REQUEST).json({ error: "bad_table" });
        return null;
    }
    const row = isPlainObject(body.row) ? body.row : undefined;
    const filter = parseFilter(body);
    if ((row && filter) || (!row && !filter)) {
        res.status(HTTP_BAD_REQUEST).json({ error: "row_xor_filter" });
        return null;
    }
    return { scope, table, row, filter };
}
