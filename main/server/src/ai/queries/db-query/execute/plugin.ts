import { clanBySlug, clanPluginDb, pluginModes, PLUGIN_DB_PREFIX } from "../../../../database/index.js";
import { resolveClanPosture } from "../../../../database/clans/access/clan-access-resolver.js";
import { isNonBlank } from "../../../../shared/validators/type-guards.js";

import { setupPluginViews } from "../../plugin-views.js";
import { queryResult, truncateRows, type QueryContext, type QueryResult } from "../types.js";

interface GateArgs {
    resolved: string;
    sql: string;
    clanSlug: string | undefined;
    ctx: QueryContext;
}

interface GateOutcome {
    error: QueryResult | null;
    db: ReturnType<typeof clanPluginDb> | null;
    posture: ReturnType<typeof resolveClanPosture> | null;
}

const gateOutcome = (
    error: QueryResult | null,
    db: GateOutcome["db"] = null,
    posture: GateOutcome["posture"] = null,
): GateOutcome => ({ error, db, posture });

function gateError(resolved: string, sql: string, error: string, clanSlug?: string): GateOutcome {
    return gateOutcome(queryResult({ sql, error, db: resolved, rows: [], clan: clanSlug }));
}

function resolveGateClan(g: GateArgs): { clan: NonNullable<ReturnType<typeof clanBySlug>> } | GateOutcome {
    const { resolved, sql, clanSlug } = g;
    if (!isNonBlank(clanSlug)) {
        return gateError(
            resolved,
            sql,
            `plugin queries require a 'clan' field naming which clan to query. example: { db: "${resolved}", clan: "<slug>", sql: "..." }`,
        );
    }
    const clan = clanBySlug(clanSlug);
    if (clan === null || clan.archived_at !== null) {
        return gateError(resolved, sql, `unknown clan '${clanSlug}'`, clanSlug);
    }
    return { clan };
}

function gatePluginQuery(g: GateArgs): GateOutcome {
    const { resolved, sql, clanSlug, ctx } = g;
    const clanGate = resolveGateClan(g);
    if (!("clan" in clanGate)) return clanGate;
    const { clan } = clanGate;
    const posture = resolveClanPosture(ctx.siteAccountId, clan.id);
    if (posture === null) return gateError(resolved, sql, `no read access to clan '${clanSlug}'`, clanSlug);
    const mode = resolved.slice(PLUGIN_DB_PREFIX.length);
    if (!pluginModes(clan.id).includes(mode)) {
        return gateError(resolved, sql, `clan '${clanSlug}' has no '${mode}' plugin db`, clanSlug);
    }
    return gateOutcome(null, clanPluginDb(clan.id, mode), posture);
}

export function executePluginQuery(
    resolved: string,
    sql: string,
    ctx: QueryContext,
    clanSlug: string | undefined,
): QueryResult {
    const gate = gatePluginQuery({ resolved, sql, clanSlug, ctx });
    if (gate.error !== null) return gate.error;
    setupPluginViews(gate.db!, gate.posture!);
    try {
        const { limited, truncated } = truncateRows(gate.db!.prepare(sql).all() as Record<string, unknown>[]);
        return queryResult({ sql, db: resolved, rows: limited, error: truncated, clan: clanSlug });
    } catch (err) {
        return queryResult({ sql, db: resolved, rows: [], error: (err as Error).message, clan: clanSlug });
    }
}
