import { SQL_TABLES } from "../../database/core/sql-columns.js";
import { listNotificationViews } from "../../notifications/notification-store.js";
import { SCOPE_APP } from "../scopes/user-scope/index.js";
import { defineTopic } from "./subscriber-projection.js";
import type { ProjectionTopic } from "./projection-types.js";

export function notificationsTopic(siteAccountId: string): ProjectionTopic {
    return defineTopic({
        triggers: [{ scopeKey: SCOPE_APP, table: SQL_TABLES.CLANSOCKET_NOTIFICATIONS }],
        query: () => listNotificationViews(siteAccountId) as unknown as Record<string, unknown>[],
        keyOf: (row) => String(row.id),
    });
}
