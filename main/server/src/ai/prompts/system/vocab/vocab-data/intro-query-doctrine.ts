export function queryObjectDoctrine(): string {
    return [
        "- `db` — the db kind to query. db-schema lists which kinds are accessible to this player.",
        "- `sql` — SELECT only. blocked: INSERT/UPDATE/DELETE/DROP/ALTER/CREATE/ATTACH/DETACH/PRAGMA/VACUUM/REINDEX. 50-row cap.",
        "- `clan` — clan slug (required when the db is clan-scoped or plugin-clan-scoped per db-schema; omit when global).",
    ].join("\n");
}
