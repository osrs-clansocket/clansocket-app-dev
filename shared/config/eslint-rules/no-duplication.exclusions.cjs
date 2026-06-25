/**
 * Files exempt from lvi/no-duplication.
 *
 * Legitimate exemption: registry files whose CONTENT is the duplication.
 * A table-name registry naming the same SQL identifiers across N entries is
 * not a DRY violation — it IS the registry's job to enumerate those names.
 *
 * Path is matched as a suffix against the file's normalized path
 * (forward slashes, relative from repo root). Whole file is exempt.
 */
module.exports = [
    {
        path: "main/dashboard/src/dom/data-rights/table-meta.ts",
        reason: "registry — declares SQL column-names + bootstrap-icon names per table for the data-rights tree summary. literal string repetition (column names, icon names) IS the registry content; SQL schemas are the source-of-truth.",
    },
    {
        path: "main/server/src/data-rights/scopes/manifest/clan-dbs.ts",
        reason: "manifest — declares per-table {action, column, table} tuples for clan-scoped purge/access plus {parentTable, parentColumn, parentKey, table} child-link tuples. each tuple maps a SQL table to its purge semantics; the repetition IS the manifest content (one entry per scoped table).",
    },
    {
        path: "main/server/src/data-rights/scopes/manifest/aux-dbs.ts",
        reason: "manifest — declares per-table {action, column, table} tuples for auxiliary db purge/access. each tuple maps a SQL table to its purge semantics; the repetition IS the manifest content.",
    },
    {
        path: "main/server/src/data-rights/scopes/manifest/plugin-tables.ts",
        reason: "manifest — declares per-table {action, column, table} tuples for plugin db purge/access. each tuple maps a SQL table to its purge semantics; the repetition IS the manifest content (one entry per plugin telemetry table).",
    },
    {
        path: "main/server/src/database/plugin/saturated-tables.ts",
        reason: "manifest — declares per-table {table, rsnColumn, hashColumn} tuples for rsn-saturation propagation across plugin/clansocket/clan dbs. each tuple maps a SQL table to its rsn+hash column pair; the repetition IS the manifest content (one entry per table that stores rsn).",
    },
    {
        path: "main/server/src/plugin-api/logger/session.ts",
        reason: "color-lookup table — declares per-event-type → ANSI color name mapping for plugin logger. each entry assigns a Color literal to a plugin telemetry event type; the repetition IS the lookup-table content (typed Color enum values reused across many event types).",
    },
];
