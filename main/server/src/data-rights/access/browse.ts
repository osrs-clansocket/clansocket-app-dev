import type { Request, Response } from "express";
import { HTTP_BAD_REQUEST, HTTP_FORBIDDEN, HTTP_NOT_FOUND } from "../../shared/http/http-status.js";

import { isClanManager } from "../../database/clans/access/clan-manager-store.js";
import { isNonBlank } from "../../shared/validators/type-guards.js";
import { parseScope, SCOPE_CLAN, SCOPE_CLAN_AUDIT, SCOPE_PLUGIN, type Scope } from "../scopes/user-scope/index.js";
import { browseManagerRows } from "./browse-manager.js";
import { browseUserRows } from "./browse-user.js";
import type { BrowseRequest } from "./browse-shared.js";

export { browseManagerRows } from "./browse-manager.js";
export { browseUserRows } from "./browse-user.js";

function clanIdScope(scope: Scope): string | null {
    if (scope.kind === SCOPE_CLAN || scope.kind === SCOPE_CLAN_AUDIT || scope.kind === SCOPE_PLUGIN) {
        return scope.clanId;
    }
    return null;
}

interface ParsedBrowse {
    scope: Scope;
    args: BrowseRequest;
    managerView: boolean;
}

function parseBrowseBody(body: Record<string, unknown>, res: Response): ParsedBrowse | null {
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
    return {
        scope,
        managerView: body.managerView === true,
        args: {
            scope,
            table,
            from: body.from as number | undefined,
            to: body.to as number | undefined,
            rsn: typeof body.rsn === "string" ? body.rsn : undefined,
            limit: body.limit as number | undefined,
            offset: body.offset as number | undefined,
        },
    };
}

function runManagerBrowse(scope: Scope, args: BrowseRequest, siteAccountId: string, res: Response): void {
    const clanId = clanIdScope(scope);
    if (clanId === null || !isClanManager(siteAccountId, clanId)) {
        res.status(HTTP_FORBIDDEN).json({ error: "not_clan_manager" });
        return;
    }
    const result = browseManagerRows(scope, args);
    if (!result) {
        res.status(HTTP_NOT_FOUND).json({ error: "not_in_manifest" });
        return;
    }
    res.json(result);
}

export function handleBrowse(req: Request, res: Response, siteAccountId: string): void {
    const parsed = parseBrowseBody((req.body ?? {}) as Record<string, unknown>, res);
    if (!parsed) return;
    if (parsed.managerView) {
        runManagerBrowse(parsed.scope, parsed.args, siteAccountId, res);
        return;
    }
    const result = browseUserRows(siteAccountId, parsed.args);
    if (!result) {
        res.status(HTTP_NOT_FOUND).json({ error: "not_in_manifest" });
        return;
    }
    res.json(result);
}
