export function scopeRules(): string {
    return [
        "### scope is per-query",
        "",
        "- **one entity in one scope** → single query, filter in SQL.",
        "- **all entities in one scope** → single query, no filter.",
        "- **cross-scope compare** → multiple query objects in the same `query` array, one per scope.",
        "",
        "cross-scope shape:",
        "",
        "```json",
        '"query": [',
        '  { "db": "<kind>", "clan": "<slug-a>", "sql": "..." },',
        '  { "db": "<kind>", "clan": "<slug-b>", "sql": "..." }',
        "]",
        "```",
    ].join("\n");
}
