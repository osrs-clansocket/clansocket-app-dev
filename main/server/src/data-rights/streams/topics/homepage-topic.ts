import { clanUiDb } from "../../../database/index.js";
import { SQL_TABLES } from "../../../database/core/sql-columns.js";
import { HOMEPAGE_SELECT_SQL } from "../../../clans/homepage/homepage-component-row.js";
import { scopeKeyClan } from "../writes-stream.js";
import { defineTopic } from "../subscriber-projection.js";
import type { ProjectionTopic } from "../projection-types.js";

export function homepageTopic(clanId: string): ProjectionTopic {
    return defineTopic({
        triggers: [{ scopeKey: scopeKeyClan(clanId), table: SQL_TABLES.CLAN_UI_COMPONENTS }],
        query: () => clanUiDb(clanId).prepare(HOMEPAGE_SELECT_SQL).all() as Record<string, unknown>[],
        keyOf: (row) => String(row.component_id),
    });
}
