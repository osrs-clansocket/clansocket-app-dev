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
    {
        path: "main/server/src/ai/prompts/sources/output/profile-fields.ts",
        reason: "axis-2 SHAPER pattern — toIdentityKey + toSessionField are typed-projection mappers (tuple → typed object). type signatures discriminate them; body-shape equivalence is by design per `rules.md ## architecture` axis-2 `shaper` role. detector clusters identical mapper bodies regardless of output type.",
    },
    {
        path: "main/server/src/ai/routes/memory-routes.ts",
        reason: "residual after real DRY win — POST + PUT handlers both delegate to `respondMemoryResult(res, memoryStore.apply(...))`. the abstraction is the consolidation; detector flags the SUCCESS of the HOF (both handlers compressed to single delegating call).",
    },
    {
        path: "main/server/src/auth/site-routes/claims/consents.ts",
        reason: "branch discrimination — `consent.kind === 'rsn'` rejects in gateConsentCancel, `consent.kind === 'claim'` triggers pushClaimCancel in the route handler. two distinct conditional branches across distinct functions on a discriminated-union field; not duplication.",
    },
    {
        path: "main/server/src/data-rights/purge/purge-dead-clans/index.ts",
        reason: "branch discrimination — `verdict === 'purge'` runs processPurge, `verdict === 'warn'` runs processWarn. two distinct conditional branches in a single 3-case verdict dispatch (purge/warn/skip); table-driven obscures the per-verdict return-shape.",
    },
    {
        path: "main/server/src/data-rights/scopes/user-scope/scope.ts",
        reason: "distinct membership tests — `SIMPLE_SCOPES.has(kind)` and `CLAN_BOUND_SCOPES.has(kind)` check membership in two DIFFERENT Sets. the `.has(kind)` shape matches but the Sets are semantically distinct scope-kind families; collapsing loses categorization.",
    },
    {
        path: "main/server/src/data-rights/temporal-correlation.ts",
        reason: "rule fires on the helper's INVOCATION sites — `skipClanWindows(clanId, windows)` IS already the consolidation (called from ownedMembers + ownedDiffs to share the guard logic). flagging the call sites as 'repeated' inverts the rule's intent.",
    },
    {
        path: "main/server/src/database/clans/audit/clan-audit/verify.ts",
        reason: "residual after real DRY win — verifyOk + verifyBreak are factories returning the same VerifyResult interface. body-shape match across 2 factories that build the SAME typed result is by design (single source of truth = the interface).",
    },
    {
        path: "main/server/src/discord/body-renderers/combat/combat-achievement-renderer.ts",
        reason: "Renderer interface contract — `renderCompleted` and `renderSnapshot` both implement `Renderer = (input) => RenderedBody`. body-shape matching is the interface's job; both renderers do distinct rendering (different payload types, different category, different content template).",
    },
    {
        path: "main/server/src/discord/body-renderers/progression/quest-renderer.ts",
        reason: "Renderer interface contract — `renderQuests` and `renderQuestCompleted` both implement `Renderer`. same situation as combat-achievement-renderer; distinct rendering paths happen to share Renderer body structure by interface design.",
    },
    {
        path: "main/server/src/discord/body-renderers/render-template.ts",
        reason: "parser-loop branch discrimination — `s[i] === CLOSE_BRACE` returns the index (token end), `s[i] === OPEN_BRACE` returns -1 (abort on nested brace). two distinct loop terminators on a char-by-char parse; collapsing into dispatch obscures the parser semantics.",
    },
    {
        path: "main/server/src/discord/routes/route-common/audit-payloads.ts",
        reason: "axis-2 SHAPER pattern — moderationAfter + webhookAfter (plus updateAuditPayload, renameAuditPayload, moderationAuditPayload) are typed-projection factories per `rules.md ## architecture` axis-2 `shaper` role. type sig IS the discriminator; existing isShaperReturnBody carve-out in no-duplication.cjs doesn't catch the `(x, y, z) => ({ x, y, z: z ?? null })` variant.",
    },
    {
        path: "main/server/src/plugin-api/transport/mode-router.ts",
        reason: "branch discrimination — `worldTypes.includes('SEASONAL')` is the seasonal-mode early-branch, `worldTypes.includes(type)` is the per-priority-tier check inside the for-loop. detector normalizes `.includes(X)` shape across these but the calls serve distinct control-flow purposes.",
    },
    {
        path: "main/server/src/wom/routes/status.ts",
        reason: "residual after real DRY win — STATUS_DEFAULTS extracted as single null-baseline; emptyStatus spreads it bare, buildLinkedStatus spreads it + overrides. detector still flags the same key-set as 2× repeated (spread expansion = same keys), but spread-then-override IS the canonical single-source-of-truth pattern.",
    },
    {
        path: "main/server/src/wom/routes/sync-now.ts",
        reason: "branch discrimination — `result.status === 'skipped-no-identity'` returns 404, `result.status === 'skipped-gate'` returns 409 with payload. two distinct conditional branches dispatching to distinct HTTP responses on a discriminated-union; not duplication.",
    },
];
