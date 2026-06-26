import { SQL_TABLES } from "../../database/core/sql-columns.js";
import { listAccountManagers } from "../../database/clans/access/clan-manager-store.js";
import { listManagedClans } from "../../clans/read-managed.js";
import { SCOPE_APP } from "../scopes/user-scope/index.js";
import { defineTopic } from "./subscriber-projection.js";
import type { ProjectionTopic, ProjectionTrigger } from "./projection-types.js";
import { scopeKeyClan } from "./writes-stream.js";

export function clansTopic(siteAccountId: string): ProjectionTopic {
    const triggers: ProjectionTrigger[] = [
        { scopeKey: SCOPE_APP, table: SQL_TABLES.CLANSOCKET_CLANS },
        { scopeKey: SCOPE_APP, table: SQL_TABLES.CLANSOCKET_CLAN_MANAGERS },
    ];
    for (const m of listAccountManagers(siteAccountId)) {
        triggers.push({ scopeKey: scopeKeyClan(m.clan_id), table: SQL_TABLES.CLAN_ROSTERS });
    }
    return defineTopic({
        triggers,
        query: () => listManagedClans(siteAccountId) as unknown as Record<string, unknown>[],
        keyOf: (row) => String(row.id),
    });
}
