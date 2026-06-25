import { DB_NAMES } from "../database/index.js";
import { selectRows } from "../shared/loaders/db-rows.js";
import type { NotificationRow } from "./notification-store.js";

export function listUndismissed(siteAccountId: string): NotificationRow[] {
    return selectRows<NotificationRow>(
        DB_NAMES.APP,
        `SELECT id, site_account_id, kind, title, body, href, dismissed, created_at
         FROM clansocket_notifications
         WHERE site_account_id = ? AND dismissed = 0
         ORDER BY created_at DESC`,
        siteAccountId,
    );
}
