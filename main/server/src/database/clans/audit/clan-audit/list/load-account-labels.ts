import { getDb } from "../../../../core/database.js";

export function loadAccountLabels(
    appDb: ReturnType<typeof getDb>,
    placeholders: string,
    ids: readonly string[],
): Record<string, string> {
    const accountRows = appDb
        .prepare(
            `SELECT id, COALESCE(display_name, '') AS label
             FROM clansocket_accounts WHERE id IN (${placeholders})`,
        )
        .all(...ids) as Array<{ id: string; label: string }>;
    const out: Record<string, string> = {};
    for (const row of accountRows) {
        if (row.label.length > 0) out[row.id] = row.label;
    }
    return out;
}
