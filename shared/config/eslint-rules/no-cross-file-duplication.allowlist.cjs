/**
 * Allowlist for LVI/no-cross-file-duplication.
 *
 * Each subtype maps fingerprint → human reason. The fingerprint comes from the
 * lint message itself (look for the "Allowlist key:" line at the bottom of any
 * cross-file-duplication finding). Copy the value after "<type>:" into the
 * matching subtype below with a one-line reason.
 *
 * Adding a fingerprint silences exactly that AST shape across the codebase.
 * Real new shapes always fire because they wont match any existing fingerprint.
 *
 * Remove an entry to re-enable the rule for that shape. If the rule's hash
 * function ever changes, all existing entries invalidate visibly (theyll stop
 * matching) — silent drift is impossible.
 */

const REQUIRE_PATH = "CommonJS require() path — relative module reference, not a domain value";
const RUNTIME_CONVENTION = "JS runtime/library convention string, not a domain value";
const SHARED_HELPER_USAGE = "intentional consumption of shared helper API — call shape repeats by design across all consumers";
const GENERIC_JS_IDIOM = "generic JS conditional idiom — AST shape too coarse to imply semantic dup; investigated partner sites confirm unrelated subsystems";
const PROMPT_API_SHAPE = "prompt-module API shape — every *-prompt.ts declares the same registerDynamic metadata fields by design; the shape IS the registration contract";
const ROUTE_SEO_SHAPE = "route seo declaration — every defineRoute() carries the same { title, description, hidden? } key set by design; the shape IS the seo contract that lvi/route-requires-seo enforces";
const DISCORD_ENTITY_CRUD_IDIOM = "discord.js entity CRUD body shape — fetch+null-guard+method-call is the canonical discord.js safe-access idiom per their API contract; refactoring into a generic helper either forces `as any` casts (loses TS narrowing on guild.X.fetch return types) or triggers AST-shape collisions with other unrelated callers (verified empirically — converting to apply pattern regressed +2 violations)";
const API_RESOURCE_KEY = "discord state-API resource identifier — string MUST match between sender (state-sync/poster.ts BULK_KEY/SINGULAR_KEY map) and caller (state-sync/ready-sync.ts orchestrator) by API contract; the duplication IS the contract";
const MUTATION_ROUTE_PAYLOAD = "mutationRoute factory's buildPayload callback return contract — MutationBuiltPayload shape `{actorUserId, targetIdOrTemp, after?, before?, auditPayload, responseExtras?}` is the typed return signature every discord/routes/{channels,roles,server-emojis,server-stickers,webhooks,guild-settings,members}/*.ts implements. Each route fills different domain values; the shape is the factory contract.";
const JS_LANGUAGE_PRIMITIVE = "JS language-level primitive — the AST shape IS the operator/method call. Wrapping into a helper destroys TypeScript narrowing (e.g. `equals(v, \"X\")` doesn't narrow `v`; `v === \"X\"` does), adds runtime indirection for zero semantic gain, and forces unrelated subsystems to share a non-existent abstraction. Real duplication surfaces via more specific shape keys that include surrounding context — silencing just this primitive removes noise without hiding signal.";
const RENDERER_CONTRACT = "discord body-renderer contract shape — every renderer-types.ts `Renderer` impl follows `const p = payload as PayloadX; const username = assembleCategoryUsername({...}); return renderResult({username, content, tokens})`. The shape IS the renderer factory pattern (renderResult + assembleCategoryUsername are the shared helpers). Each renderer fills domain-specific PayloadX + content template + tokens map. Centralizing further loses the per-event payload typing.";
const DEBUG_LOOP_IDIOM = "`logger.debug(subsystem-msg); for (item of items) {...}` — every site has a subsystem-scoped log line (`[purge-app]`, `[wom-snapshot-planner]`, `[discord]` etc.) followed by a domain-specific iteration. Wrapping into `withDebugLoop(label, items, body)` inflates the call site (passes the body as a callback) and buries per-subsystem identity from grep/breakpoint context. The pattern IS the language idiom for 'log then iterate'.";
const ARRAY_BUILDER_IDIOM = "imperative array-builder — `const arr = []; for (...) arr.push(...); return arr;` is the JS pattern when `.map()` doesn't apply (conditional push, multi-emit per iteration, early break). Wrapping into a generic builder helper destroys readability + control-flow visibility. Real dup would include the SQL/condition/transform body, which fires on more specific structural keys.";
const PROJECTION_HANDLER_SHAPE = "canonical projection-handler helper shape — every database/plugin/projection/*.ts implements upsertX/emitXChange/readPriorX with the same destructure+sql-or-emit body. Each handler binds different SQL/emitter against different domain entities (prayer/quest/diary/boost/clue/stat/...). The shape IS the projection-pattern contract for `apply latest snapshot + emit change events`. Centralizing into a generic dispatcher loses typed args per entity (PrayerEntry vs QuestEntry vs ...) without reducing code volume.";
const SHARED_CONSTANT_DEFINITION_DIGIT = JS_LANGUAGE_PRIMITIVE + " Specifically: small integer literals appearing inside shared-constants definition sites (shared/time.ts, shared/byte-units.ts, shared/parsers/decimal-parser.ts) plus equipment-slot ID lookup tables (database/plugin/projection/containers/container-slots.ts). The digit IS the value being centralized — extracting further (BASE_DIGIT_5 = 5) adds zero clarity. The dup detector keys on the raw integer regardless of multiplication context (`5 * MS_PER_MINUTE`, `5 * BYTES_PER_MEGABYTE`, `5: \"SHIELD\"` slot ID).";

module.exports = {
    literal: {
        '"error"': "EventEmitter `error` event name — Node http, Discord.js, etc. — third-party API contract, not a domain value",

        '"./constants"': REQUIRE_PATH,
        '"../core/constants"': REQUIRE_PATH,
        '"../../core/constants"': REQUIRE_PATH,
        '"../utils/logger"': REQUIRE_PATH,
        '"../../utils/logger"': REQUIRE_PATH,
        '"../core/api-client"': REQUIRE_PATH,
        '"./plugins"': REQUIRE_PATH,
        '"discord.js"': REQUIRE_PATH,
        '"path"': REQUIRE_PATH,

        '"utf8"': RUNTIME_CONVENTION,
        '".js"': RUNTIME_CONVENTION,

        '"content"': PROMPT_API_SHAPE,
        '"system"': PROMPT_API_SHAPE,
        '"mode"': PROMPT_API_SHAPE,
        '"schema"': PROMPT_API_SHAPE,
        '"template"': PROMPT_API_SHAPE,
        '"context-acquisition"': PROMPT_API_SHAPE,
        '"dom-reference"': PROMPT_API_SHAPE,
        '"vocab-dom"': PROMPT_API_SHAPE,
        '"chain-protocol"': PROMPT_API_SHAPE,
        "8": PROMPT_API_SHAPE,
        "9": PROMPT_API_SHAPE,
        "15": PROMPT_API_SHAPE,
        "16": PROMPT_API_SHAPE,
        "17": PROMPT_API_SHAPE,
        "18": PROMPT_API_SHAPE,

        "5": SHARED_CONSTANT_DEFINITION_DIGIT,
        "7": SHARED_CONSTANT_DEFINITION_DIGIT,
        "10": SHARED_CONSTANT_DEFINITION_DIGIT,
        "60": SHARED_CONSTANT_DEFINITION_DIGIT + " The five `60` sites are entirely unrelated semantic uses (60-day clan retention, 60-second `MS_PER_MINUTE` definition, 60-char SEO max length, 60-rpm rate limit, 60-second slot duration config max) — naming each as a per-domain constant moves the literal but doesnt eliminate it.",

        '"mutation"': PROMPT_API_SHAPE,
        '"read"': PROMPT_API_SHAPE,
        '"create"': PROMPT_API_SHAPE,
        '"```"': "markdown code-fence delimiter — appears in every prompt that renders a fenced code block (json example, sql example, raw output snippet); identical literal by markdown spec, not duplication",
        '"```json"': "markdown json-fence delimiter — appears in every prompt that renders a JSON example block; identical literal by markdown spec, not duplication",

        '"server-emojis"': API_RESOURCE_KEY,
        '"server-stickers"': API_RESOURCE_KEY,

        '"./types.js"': "axis-3 types-file convention — every feature folder declares its types in `./types.ts` per CLAUDE.md naming doctrine (`<prefix>-<parent-singular>.ts` with `types` as the canonical type-declarations filename). Renaming to break the dup match would violate doctrine. The literal IS the convention.",
    },
    structural: {
        "B(R(O(P(I:I),P(I:I),P(I:I))))": "3-property typed factory function — appears in every typed-config source module (db-kinds.kind(), time-config.tier(), query-patterns.pattern(), etc) by design — the factory IS the typing contract for that source's entries.",
        "B(R(C(M(C(M(I.map):1).join):1)))": "prompt section renderer — `return ITEMS.map(...).join(\"\\n\")` is the standard shape for inline list/section render from source data. recurs across every prompt that builds a section by mapping source entries.",
        "B(V(C(M(C(M(I.map):1).join):1));R(T(2)))": "prompt section renderer with template-literal wrap — `const lines = ITEMS.map(...).join(\"\\n\"); return \\`heading\\n${lines}\\``. recurs across every prompt section builder.",
        "B(V(C(M(I.map):1));R(C(M(A(L(string),L(string),L(string),L(string),S).join):1)))": "prompt section renderer with intro+spread+outro — `const items = ITEMS.map(...); return [intro, ...items, outro].join(\"\\n\")`. recurs across prompt section builders that wrap a rendered list.",
        "B(V(C(M(I.map):1));R(C(M(A(L(string),L(string),C(M(I.join):1),L(string),L(string)).join):1)))": "prompt section renderer variant with nested join — same pattern as above with an extra join in the intro line.",
        "O(P(I:I),P(I:I))": "2-property object literal in .map() factory — every typed source module that builds entries via `tuple.map(([a, b]) => ({ a, b }))` produces this shape. inherent to typed data construction.",
        "O(P(I:I),P(I:I),P(I:I),P(I:I),P(I:I))": "5-property object literal in .map() factory — same pattern for richer typed entries (ProfileBucket, DomVerb base shape, etc).",
        "===(M(I.auditedAs),I)": "DOM verb category filter — `v.auditedAs === category` is the canonical filter against `DOM_VERBS`, used in vocab-dom verbNamesIn() and action-schema verbUsageSection(). by-design shared filter against the same source.",
        "B(E(C(M(I.I):2)))": "investigated: `onClientEvent(level)` returns level-parameterized Discord event-logger arrow in client.js; `safePost(...).catch(err => logger.error(label, err))` is HTTP-error catch in api-client.js. Both arrows wrap a single 2-arg logger call but take different params (msg vs err) and serve different subsystems. Cannot unify without forcing one into the other's shape.",
        "B(R(O(P(I:I),P(I:I))))": "investigated: `who(guildId, userId)` builds audit-context `{guildId,userId}` in handlers/audit.js; `ephemeralReply(content)` builds Discord-reply payload `{content,flags:EPHEMERAL}` in handlers/interaction-reply.js. Both are 2-property factories but for unrelated domain structures (audit context vs Discord interaction payload). Cannot unify.",

        "B(V(A);V(A);IF(U!(I):T);E(A);R(O(P(I:L(object)))))": DISCORD_ENTITY_CRUD_IDIOM + "; here: publish-queue/handlers/{roles,server-emojis,server-stickers}/delete.ts — fetch guild, fetch entity-by-id, throw on null, call delete(), return null-snowflake. discord.js separates each entity collection into independent typed managers, so the fetch return types diverge per entity.",
        "B(V(A);R(M(I.id)))": DISCORD_ENTITY_CRUD_IDIOM + "; here: publish-queue/handlers/{server-emojis,server-stickers}/create.ts — await guild.X.create followed by return entity.id. canonical discord.js entity-creation; the typed-manager call IS the per-entity contract.",
        "B(V(A);IF(U!(I):T);E(A))": DISCORD_ENTITY_CRUD_IDIOM + "; here: publish-queue/handlers/{server-emojis,server-stickers}/update.ts — fetch entity, throw on null, call edit(). same per-entity typed-manager constraint.",
        "B(V(A);R(??(C,A())))": "DB loader fallback idiom — await primaryQuery followed by `?? fallbackQuery()` in loaders/{outbound-loader,publish-queue-loader}.ts. each loader has its own primary/fallback pair against a different table; abstracting would require passing query-string params and lose type safety on the row type without saving any code.",

        "B(E(C(M(C(M(I.status):1).json):1)))": "Express response idiom — `res.status(CODE).json(BODY)` is the canonical error-response shape. Every route emits this; centralizing into a helper would either need typed status/body parameters (recreating the same dup at call sites) or lose readability.",

        "B(V(I);E(C(M(C(M(I.prepare):1).run):1)))": PROJECTION_HANDLER_SHAPE + " — `function upsertX(args) { const { ... } = args; conn.prepare(SQL).run({bindings}); }`. Each projection's upsert has bespoke SQL + bindings against a domain-specific table.",
        "B(E(C(M(C(M(I.prepare):1).run):2)))": PROJECTION_HANDLER_SHAPE + " — single-statement variant: `function clearXX(conn, accountHash, now) { conn.prepare(SQL).run(arg1, arg2); }`.",
        "B(V(I);E(C(M(I.emit):1)))": PROJECTION_HANDLER_SHAPE + " — `function emitXChange(args) { const { ... } = args; emitter.emit({dedupKind, dedupParts, specific, ...}); }`. Each projection's change-emit binds bespoke entity ids and dedup tuple.",
        "B(V(I);E(C(M(I.emit):6)))": PROJECTION_HANDLER_SHAPE + " — positional-emit variant `const emitter = buildChangeEmitter(...); emitter.emit(id, envelope, where, dedupKind, dedupParts, specific)`. Same per-handler bespoke binding as `:1` above; the API moved to 6 positional args to drain a 16-site `{id,envelope,where,dedupKind,dedupParts,specific}` literal-object dup. The shape persists by design at each event-handler.",
        "B(V(T);R(??(C,L(object))))": PROJECTION_HANDLER_SHAPE + " — `function readPriorX(conn, ...) { const row = conn.prepare(SQL).get(...) as X | undefined; return row?.col ?? null; }`. Standard prior-snapshot lookup against domain-specific table+column.",
        "B(R(C(f<startSseSubscription>:1)))": SHARED_HELPER_USAGE + "; here: publish-queue/subscriber.ts + watchers/bots-watcher.ts both call startSseSubscription() from shared/sse-subscription.js — single-call body IS the helper contract.",
        "B(E(C(M(I.warn):1)))": SHARED_HELPER_USAGE + "; here: publish-queue/subscriber.ts + watchers/bots-watcher.ts both call logger.warn(reconcile-failure-msg) inside their respective .catch handlers — standard error-log shape against shared logger.",
        "B(V(T(2));R(C(f<apiRequest>:3)))": "discord state-API special endpoint — template-literal path build + return apiRequest call in state-sync/features/post-features.ts (uses /servers/{guildId}/features) + state-sync/guild-settings/post-upsert.ts (single-entity at /guild-settings/{guildId}). these two endpoints have unique URL shapes that don't fit the generic poster.ts contract — pair-wise too small to extract another shared helper without adding more parameter complexity than the current direct calls.",

        "B(E(C(M(I.debug):1));F)": DEBUG_LOOP_IDIOM,
        "B(V(A());F;R(I))": ARRAY_BUILDER_IDIOM,
        "B(V(A());F;R(C(M(I.join):1)))": ARRAY_BUILDER_IDIOM + " — variant returning `.join(SEP)` for string composition. Used in token-mint pickChars, human-readable-code encodeBytes/formatHumanReadable, sql-query-formatter, etc. — each builds a different string from different sources.",
        "B(V(T);V(C(f<assembleCategoryUsername>:1));R(C(f<renderResult>:1)))": RENDERER_CONTRACT,
        "B(V(O());F;R(I))": "imperative object-builder — `const out = {}; for (...) out[key] = ...; return out;` is the JS pattern when `Object.fromEntries(...)` doesn't apply (transformation per iteration, conditional skip, nested compute). Same justification as array-builder: real dup includes the iteration body which fires on more specific keys.",
        "B(V(T);V(O());F;R(I))": "imperative object-builder with leading source-row fetch — `const rows = T; const out = {}; for (const r of rows) out[r.x] = r.y; return out;`. Same justification as `B(V(O());F;R(I))` (the iteration body is the real dup signal); the leading const-decl is the row-source lookup that varies per site (clan-titles vs actor-displays).",
        "B(F;R(L(boolean)))": "JS search-loop idiom — `for (...) { if (cond) return true } return false`. Sites: validateProjectionSubs (route-validation), hasRenderableString/hasRenderableObject (renderable-checks), projection.ts diff-walker. Each loop body checks different domain conditions; the early-exit-on-match shape IS the language idiom for `any/some`. Could rewrite as `arr.some(fn)` but loses early-exit on side-effect ops or when iterating a non-array.",
        "B(V(T);R(C(M(I.map):1)))": "JS transform idiom — `const rows = T; return rows.map(fn)`. Two sites: clan-plugin-presets/override.ts:listOverrides (row→record) and runewatch/flagged-by-clan.ts:loadClanMembers (row→{original,normalized}). Each map fn has bespoke per-row transform; the const-then-map shape is the JS pattern for `fetch then transform` when the source needs a typed local for readability.",
        "B(R(O(S,P(I:I))))": "JS spread+1key return — `return { ...x, key: value }` is the JS pattern for shallow-extending an object with one override. Sites: ai/chain/response-parser/index.ts:34 (`{...projectParsed({}), message: text}` fallback) + ai/chain/chain-step/advance/continuation-step.ts:32 (`{...r, kind: KIND_CALL_LLM}` step-tagging). Unrelated semantics, identical AST shape; the spread IS the idiom.",
        "B(E(C(M(I.debug):1));F;F)": DEBUG_LOOP_IDIOM + " — variant with TWO loops: `logger.debug(label); for (...) {...} for (...) {...}`. Sites: data-rights/purge/purge-user/purge-app.ts (byHash + bySite stmt loops) + data-rights/purge/purge-user/guild-tables.ts (similar 2-collection iteration). Same justification as the single-loop variant; each domain has 2 distinct stmt collections.",
        "-(M(I.priority),M(I.priority))": JS_LANGUAGE_PRIMITIVE + " Specifically: `(a, b) => a.priority - b.priority` Array.sort comparator. Native JS sort primitive — every priority-ordered collection sort uses this exact AST. Wrapping into `byPriority(a, b)` adds zero clarity and removes a 1-line idiom.",
        "===(M(I.name),L(string))": JS_LANGUAGE_PRIMITIVE + " Specifically: `obj.name === \"literal\"` — mirror of allowlisted `===(M(I.type),L(string))` and `===(M(I.kind),L(string))` for the `name` discriminant/filter convention. Sites: data-rights/access/browse-builder.ts + browse-manager.ts (column-name filters); TS narrowing primitive.",
        "B(R(M(I.size)))": JS_LANGUAGE_PRIMITIVE + " Specifically: `return map.size` / `return set.size` — native Map/Set property access. Sites: database/core/db-cache.ts (cache size) + ai/chain/chain-state-store.ts (active chain count). Wrapping a 1-property read adds nothing.",
        "===(M(I.table),I)": JS_LANGUAGE_PRIMITIVE + " Specifically: `entry.table === T` identifier compare for table-matching predicates. Mirror of allowlisted `===(M(I.name),L(string))` and `===(M(I.kind),L(string))`; TS narrowing primitive over the `table` discriminant.",
        "B(R(??(I,L(object))))": JS_LANGUAGE_PRIMITIVE + " Specifically: `return x ?? null` — universal null-coalescing return. Variant of allowlisted PROJECTION_HANDLER_SHAPE `B(V(T);R(??(C,L(object))))`; native JS nullish-coalescing primitive.",
        "B(R(??(C,L(object))))": JS_LANGUAGE_PRIMITIVE + " Specifically: `return call() ?? null` — call+null-coalesce return. Same family as `B(R(??(I,L(object))))`; native JS primitive.",
        "B(R(??(T,L(object))))": JS_LANGUAGE_PRIMITIVE + " Specifically: `return template ?? null` — template-expression+null-coalesce return. Same family as the other `B(R(??(...)))` variants; native JS primitive.",
        "B(E(C(M(I.delete):1));E(C(M(I.delete):1)))": JS_LANGUAGE_PRIMITIVE + " Specifically: `m.delete(x); n.delete(y);` — two consecutive Map/Set.delete calls. Native JS Map/Set API primitive; sites delete from distinct collections (different cleanup paths in different subsystems).",
        "B(V(A);IF(U!(M(I.ok)):T);R(T))": "fetch-then-gate idiom — `const r = await call(); if (!r.ok) throw error; return r.value;`. Sites: auth/oauth/oauth-client.ts + auth/oauth/discord-bot-install.ts (different fetch targets, identical error-gate shape). The 3-statement gate IS the JS pattern for `await result-or-throw`.",
        "B(V(T);R(??(I,L(object))))": JS_LANGUAGE_PRIMITIVE + " Specifically: `const x = T; return x ?? null` — bind-and-coalesce pattern. Variant of `B(R(??(I,L(object))))` already allowlisted; same primitive idiom, common when the result needs a typed local before returning.",
        "B(R(C(M(C(M(C(f<getDb>:1).prepare):1).run):1)))": JS_LANGUAGE_PRIMITIVE + " Specifically: `return getDb(...).prepare(SQL).run(arg)` one-shot SQL exec. Variant of allowlisted PROJECTION_HANDLER_SHAPE `B(V(I);E(C(M(C(M(I.prepare):1).run):1)))`; each site has bespoke SQL against domain-specific table.",
        "B(E(C(M(C(M(I.prepare):1).run):1)))": JS_LANGUAGE_PRIMITIVE + " Specifically: `conn.prepare(SQL).run(arg)` — single-statement prepare+run. Mirror of allowlisted PROJECTION_HANDLER_SHAPE `:2` variant; native better-sqlite3 idiom.",
        "B(V(C(f<getDb>:1));F;F)": "two-loop iteration idiom — `const db = getDb(...); for (...) {...} for (...) {...}` against two prepared-statement collections. Variant of allowlisted `B(E(C(M(I.debug):1));F;F)` without the log prefix; sites iterate distinct domain stmt collections (collect-user-stats + collect-user/top-level).",
        "M(I.account_hash)": JS_LANGUAGE_PRIMITIVE + " Specifically: bare `obj.account_hash` member access. Member-access AST node, ubiquitous in WhoWhatWhereWhen-doctrine code where every plugin/clansocket/clan row has an `account_hash` field. Wrapping is incoherent — it IS the property name.",
        "U!(C(M(I.has):1))": JS_LANGUAGE_PRIMITIVE + " Specifically: `!set.has(x)` / `!map.has(x)` — negated Map/Set membership check. Mirror of `logical:U!(C(M(I.has):1))` (the dup detector classifies the same shape under both subtypes in different surrounding contexts). Sites: data-rights/access/browse-user.ts:126, data-rights/access/sql-column-builders.ts:10, data-rights/collect/collect-common/strip-blobs.ts:4, database/site/runewatch/delete-missing-cases.ts:15 — 4 unrelated subsystems.",
        "!==(I,L(object))": JS_LANGUAGE_PRIMITIVE + " Specifically: `x !== null` — null-non-equality check. Structural classification mirror of `logical:!==(I,L(object))`. Sites: ai/chain/response-parser/index.ts:47, database/clans/audit/clan-audit/list/index.ts:37 — unrelated subsystems each guarding a different nullable.",
        "B(E(C(M(C(M(I.status):1).json):1));R(L(object)))": "Express response idiom with explicit return — `res.status(CODE).json(BODY); return X;`. Variant of allowlisted `B(E(C(M(C(M(I.status):1).json):1)))` (the call alone) wrapped in a function body that returns. Sites: clans/composers/linker-reassign-ops.ts:10, clans/manage-routes/seo-routes.ts:13 — each route-helper has bespoke status + body. Helper-wrapping with typed args recreates dup at call sites.",
        "===(Utypeof(I),L(string))": JS_LANGUAGE_PRIMITIVE + " Specifically: `typeof x === \"string\"` — JS typeof guard. Structural classification mirror of `logical:===(Utypeof(I),L(string))`. Sites: database/discord/state/members/list-members.ts:36, database/discord/state/server-emojis/list-server-emojis.ts:29 — TS-narrowing primitive used in unrelated nullable-shape coercions.",
    },
    logical: {
        "U!(C(M(I.has):1))": JS_LANGUAGE_PRIMITIVE + " Specifically: `!map.has(x)` / `!set.has(x)` — negated Map/Set membership check. Native JS API call.",
        "===(Utypeof(I),L(string))": JS_LANGUAGE_PRIMITIVE + " Specifically: `typeof x === \"string\"` — JS typeof guard. Universal type-check primitive.",
        "===(M(I.size),L(number))": JS_LANGUAGE_PRIMITIVE + " Specifically: `set.size === N` / `map.size === N` — collection size check. Native API primitive.",
        "<=(M(I.length),I)": JS_LANGUAGE_PRIMITIVE + " Specifically: `arr.length <= n` cardinality check. Generic array-size primitive.",
        "||(<(I,I),>(I,I))": JS_LANGUAGE_PRIMITIVE + " Specifically: `a < b || c > d` — disjoint range check. Generic comparison primitive disjunction.",
        "C(M(I.includes):1)": JS_LANGUAGE_PRIMITIVE + " Specifically: `arr.includes(x)` / `str.includes(substr)` — Array/String prototype contains check. Native JS API.",
        "===(M(I.type),L(string))": JS_LANGUAGE_PRIMITIVE + " Specifically: `obj.type === \"literal\"` — same as `===(M(I.kind),L(string))` already excluded; mirror for the `type` discriminant convention.",
        "===(I,U-(L(number)))": "found-not-found sentinel — `idx === -1`, `pos === -1` etc. are canonical JS array/string search results. Same as `length === 0` cardinality check — bedrock idiom; each consumer asks about a different search.",
        "||(U!(I),!==(M(I.archived_at),L(object)))": "canonical clan-existence-and-active guard — `!clan || clan.archived_at !== null` is the standard 2-condition check before operating on a clan. Used in every clan-scoped route as the lookup-then-validate gate; the shape IS the clan-availability contract.",
        "C(M(I.I):0)": "investigated: 3 unrelated subsystems each guard on a no-arg boolean predicate — `interaction.isChatInputCommand()` (Discord interaction type), `client.isReady()` (Discord client connection state), `entry.isDirectory()` (fs Dirent type). Shape coincidence, no shared semantic.",
        "U!(C(I:2))": `${SHARED_HELPER_USAGE}; here: handlers/{message,interaction}/executor.js both call \`!acceptsEvent(plugin, event)\` via shared handlers/plugin/filter.js`,
        "U!(C(M(I.I):1))": `${GENERIC_JS_IDIOM}; here: \`!fs.existsSync(dir)\` (plugin/loader.js), \`!content.startsWith(prefix)\` (message/executor.js), \`!dep.startsWith('.')\` (ast-parser.js), \`!content.includes(MODULE_EXPORTS_PREFIX)\` (module-parser.js), \`!line.includes(quote, ...)\` (module-parser.js), \`!Array.isArray(userPermissions)\` (security/permissions.js), \`!interaction.isChatInputCommand()\` (slash.js)`,
        "M(I.I)": `${GENERIC_JS_IDIOM}; here: \`rateLimit.allowed\` (rate-limit.js gate), \`plugin.handleError\` (plugin/error-handler.js dispatch), AST-walker property checks (docs-generator.js). Each is a tiny in-helper boolean predicate, not extractable as a shared concept.`,
        "U!(I)": `${GENERIC_JS_IDIOM}; here: \`!plugin\` (slash.js lookup-result null check), \`!requiredPermission\` (security/permissions.js function-arg presence), \`!permitted\` (message/executor.js permission-check result), \`!allowed\` (post-enforceRateLimit caller side). 4 unrelated boolean negations.`,
        "C(I:1)": `${GENERIC_JS_IDIOM}; here: permission check at security/permissions.js + AST-walker function call at utils/docs/parser/ast-parser.js. Unrelated.`,
        "C(I:2)": `${GENERIC_JS_IDIOM}; here: \`if (someFn(a, b))\` at module-parser.js + security/permissions.js. Two different 2-arg predicates, unrelated subsystems.`,
        "U!(A)": `${SHARED_HELPER_USAGE}; here: \`if (!(await enforceRateLimit({...})))\` in slash.js + message/executor.js — both call the centralized rate-limit gate from handlers/rate-limit.js and early-exit on failure. The await-negate-and-abort idiom is the natural early-exit shape for async gate helpers.`,

        "!==(I,L(object))": SHARED_HELPER_USAGE + "; here: `if (tk !== null) tokens.push(tk)` in outbound/senders/webhook-heal-sender.ts + state-sync/per-channel-sync.ts — both collect tokens from extractWebhookTokenIfAvailable() which returns WebhookTokenSync|null by design; the null-filter idiom is enforced by the helper signature.",

        "===(I,L(string))": JS_LANGUAGE_PRIMITIVE + " Specifically: `var === \"literal\"` string compare. TypeScript narrows the union from this idiom; wrapping into a helper destroys that narrowing. Real string-literal duplication fires separately via `literal:\"X\"` keys — the AST shape alone is too coarse to imply semantic dup.",
        "C(M(I.has):1)": JS_LANGUAGE_PRIMITIVE + " Specifically: `someMap.has(x)` / `someSet.has(x)` — native Map/Set/WeakSet method call. The data structure IS the abstraction; wrapping `mapHas(map, x)` adds indirection with zero gain.",
        "===(I,I)": JS_LANGUAGE_PRIMITIVE + " Specifically: identifier-to-identifier equality (`a === b`). Universal comparison primitive across unrelated subsystems.",
        "===(M(I.kind),L(string))": JS_LANGUAGE_PRIMITIVE + " Specifically: `obj.kind === \"literal\"` — the canonical TypeScript discriminated-union narrowing pattern. THE idiomatic way to narrow tagged unions. Wrapping destroys narrowing entirely.",
        ">(I,L(number))": JS_LANGUAGE_PRIMITIVE + " Specifically: `var > N` numeric threshold checks. Generic comparison primitive.",
        "<(I,I)": JS_LANGUAGE_PRIMITIVE + " Specifically: `a < b` identifier ordering. Generic comparison primitive.",
        ">=(I,I)": JS_LANGUAGE_PRIMITIVE + " Specifically: `a >= b` identifier ordering. Generic comparison primitive.",
        ">(M(I.length),I)": JS_LANGUAGE_PRIMITIVE + " Specifically: `arr.length > n` cardinality check. JS array/string size primitive.",
        "||(U!(I),===(M(I.length),L(number)))": JS_LANGUAGE_PRIMITIVE + " Specifically: `!x || x.length === 0` empty-check. Where applicable, sites have already been migrated to `isNonBlank()` (shared/validators/type-guards.ts); remaining hits are on unions where the helper's `is string` narrowing doesn't fit (e.g. `Buffer | null` checks, custom empty-check semantics).",
        "C(f<existsSync>:1)": JS_LANGUAGE_PRIMITIVE + " Specifically: `existsSync(path)` — Node.js fs primitive. Every site has a different path arg; the call itself is the abstraction.",
        "<=(I,L(number))": JS_LANGUAGE_PRIMITIVE + " Specifically: `var <= N` numeric threshold. Generic comparison primitive.",
        "<(I,L(number))": JS_LANGUAGE_PRIMITIVE + " Specifically: `var < N` numeric threshold. Generic comparison primitive.",
        "!==(I,I)": JS_LANGUAGE_PRIMITIVE + " Specifically: identifier inequality (`a !== b`). Universal comparison primitive.",
        ">(I,I)": JS_LANGUAGE_PRIMITIVE + " Specifically: `a > b` identifier ordering. Generic comparison primitive.",
        "!==(M(I.status),L(string))": JS_LANGUAGE_PRIMITIVE + " Specifically: `result.status !== \"literal\"` — inverse of the discriminated-union narrowing already excluded (`===(M(I.kind),L(string))`). Used in verify-credentials/claim-finalize/name-change result-status checks. THE idiomatic TypeScript way to early-exit on tagged-union non-match.",
        "&&(===(Utypeof(I),L(string)),>(M(I.length),L(number)))": JS_LANGUAGE_PRIMITIVE + " Specifically: `typeof x === \"string\" && x.length > N` — non-empty-string-with-min-length validation idiom. Generic — sites have different min N values.",
        "||(U!(C(M(I.isFinite):1)),<=(I,L(number)))": JS_LANGUAGE_PRIMITIVE + " Specifically: `!Number.isFinite(x) || x <= N` — positive-finite validation. Each site has a different threshold N; generic numeric validation primitive.",
        "||(===(I,L(object)),===(I,L(object)))": JS_LANGUAGE_PRIMITIVE + " Specifically: `x === null || y === null` — two-arg null disjunction. Each site checks different null-eligible identifiers; pure boolean disjunction primitive.",
        "||(===(I,L(object)),===(M(I.length),L(number)))": JS_LANGUAGE_PRIMITIVE + " Specifically: `x === null || x.length === 0` — null-or-empty check on array/string. Mirror of `!x || x.length === 0` already excluded; same justification — generic empty-check.",
        "in(L(string),I)": JS_LANGUAGE_PRIMITIVE + " Specifically: `\"key\" in obj` — JS `in` operator for own-property check. Native language operator.",
        "C(M(I.startsWith):1)": JS_LANGUAGE_PRIMITIVE + " Specifically: `str.startsWith(prefix)` — String prototype method. Native JS API.",
        "&&(!==(I,L(object)),!==(I,I))": JS_LANGUAGE_PRIMITIVE + " Specifically: `a !== null && b !== c` — null-guard followed by identifier inequality. Generic narrow-then-compare idiom.",
        "||(===(I,L(string)),===(I,L(string)))": JS_LANGUAGE_PRIMITIVE + " Specifically: `a === \"x\" || b === \"y\"` — string-literal disjunction. Each site checks different identifiers against different literals; pure boolean disjunction over string comparisons.",
        "===(M[I],I)": JS_LANGUAGE_PRIMITIVE + " Specifically: `obj[key] === value` — bracketed member-access equality. Native dynamic-key comparison.",
    },
    data: {
        "audit,guildId,key,replyWith,userId": `${SHARED_HELPER_USAGE}; here: 5-key options object passed to \`enforceRateLimit({audit, guildId, key, replyWith, userId})\` by slash.js + interaction/executor.js + message/executor.js`,

        "always_load,depends_on,id,placeholders,priority,triggers,type": PROMPT_API_SHAPE,
        "always_load,auto_load_schemas,depends_on,id,placeholders,priority,triggers,type": PROMPT_API_SHAPE,

        "description,hidden,title": ROUTE_SEO_SHAPE,
        "description,title": ROUTE_SEO_SHAPE,

        "clanId,kind,mode": "Scope discriminated-union shape — `{kind: SCOPE_PLUGIN, clanId, mode}` is the typed Scope variant for plugin-scoped data. Every plugin-scope consumer (scope-key, scopes/index, scope parse) constructs this shape because it's the union member.",
        "message,ok,reason": "standard server-error JSON response body — `{ok: false, reason, message}` is the canonical 400/404 response shape used by every route's gate function. Each consumer fills different reason+message values; the keyset IS the API contract documented in route conventions.",

        "actorUserId,after,auditPayload,targetIdOrTemp": MUTATION_ROUTE_PAYLOAD,
        "actorUserId,auditPayload,targetIdOrTemp": MUTATION_ROUTE_PAYLOAD,
        "actorUserId,after,auditPayload,responseExtras,targetIdOrTemp": MUTATION_ROUTE_PAYLOAD,
        "actorUserId,after,auditPayload,before,targetIdOrTemp": MUTATION_ROUTE_PAYLOAD,

        "dedupKind,dedupParts,envelope,id,specific,where": PROJECTION_HANDLER_SHAPE + " — `emitter.emit({id, envelope, where, dedupKind, dedupParts, specific})` typed-args-object literal at projection event-handler call sites. The `ChangeEmitArgs` interface IS the typed helper contract; positional refactor was tried and intentionally reverted to keep the typed-args-object shape (per the established codebase style of single typed args-object over positional 6+ args). Sites: database/plugin/projection/events/slayer.ts:62, database/plugin/projection/stats/stat-changes.ts:19 — each emits bespoke entity ids and dedup tuples; the shape persists by design.",

    },
    behavioral: {
    },
    validation: {
        "===(Utypeof(I),L(string))": `${GENERIC_JS_IDIOM}; here: \`typeof raw === 'number'\` (env-var coercion in core/config.js), \`typeof item === 'object'\` (AST walker in ast-parser.js). Both are standard JS type guards in unrelated subsystems.`,

        "===(Utypeof(M(I.name)),L(string))": "discord.js nullable-name type guard — `typeof channel.name === 'string'` in state-sync/channel-pins/extract.ts + state-sync/webhooks/extract.ts. discord.js types channel.name as `string | null`, so the typeof-narrow IS the discord.js runtime contract for safely reading name (not a refactorable concept — narrowing pattern enforced by discord.js types).",
    },
    temporal: {
        "setTimeout:I": JS_LANGUAGE_PRIMITIVE + " Specifically: `setTimeout(fn, ms)` with a variable interval. Two sites: dev.ts (probe-retry interval) + plugin-api/session/socket-state.ts (heartbeat watchdog timeout). Different subsystems, different timeout semantics. The native API call IS the abstraction.",
    },
};
