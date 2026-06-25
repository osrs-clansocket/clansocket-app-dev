import { clanBySlug, getClanDb, type ClanRow } from "../../../../database/index.js";
import { resolveClanPosture } from "../../../../database/clans/access/clan-access-resolver.js";
import { isNonBlank } from "../../../../shared/validators/type-guards.js";

import { CLAN_DB, queryResult, truncateRows, type QueryContext, type QueryResult } from "../types.js";

interface ClanQueryGate {
    clan: ClanRow;
}

function gateClanQuery(sql: string, ctx: QueryContext, clanSlug: string | undefined): ClanQueryGate | QueryResult {
    if (!isNonBlank(clanSlug)) {
        return queryResult({
            sql,
            db: CLAN_DB,
            rows: [],
            error: `clan queries require a 'clan' field naming which clan to query. example: { db: "${CLAN_DB}", clan: "<slug>", sql: "..." }`,
        });
    }
    const clan = clanBySlug(clanSlug);
    if (clan === null || clan.archived_at !== null) {
        return queryResult({ sql, db: CLAN_DB, rows: [], error: `unknown clan '${clanSlug}'`, clan: clanSlug });
    }
    const posture = resolveClanPosture(ctx.siteAccountId, clan.id);
    if (posture === null) {
        return queryResult({
            sql,
            db: CLAN_DB,
            rows: [],
            error: `no read access to clan '${clanSlug}'`,
            clan: clanSlug,
        });
    }
    return { clan };
}

export function executeClanQuery(sql: string, ctx: QueryContext, clanSlug: string | undefined): QueryResult {
    const gate = gateClanQuery(sql, ctx, clanSlug);
    if ("rows" in gate) return gate;
    try {
        const { limited, truncated } = truncateRows(
            getClanDb(gate.clan.id).prepare(sql).all() as Record<string, unknown>[],
        );
        return queryResult({ sql, db: CLAN_DB, rows: limited, error: truncated, clan: clanSlug });
    } catch (err) {
        return queryResult({ sql, db: CLAN_DB, rows: [], error: (err as Error).message, clan: clanSlug });
    }
}
