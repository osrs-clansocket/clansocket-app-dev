/**
 * Universal LVI rule registry — every rule that is code-pattern-based (not surface-bound
 * by inherent semantics) applies across server / dashboard / discord. Rules that only fire
 * on specific paths self-gate inside the rule body and report nothing where the pattern
 * cannot occur.
 *
 * Surface-specific rules that ARE excluded from this registry (kept in their own config):
 *   - dashboard: no-raw-dom, require-component, mirror-pages, etc. (DOM/component-specific)
 *   - dashboard: no-raw-handler / no-raw-effect / no-raw-reactive (signal-substrate-specific)
 *   - dashboard: no-bare-effect (dashboard's effect() returning Disposable contract)
 *   - dashboard: no-temp-wrapper-instance (dashboard factory's createInstance() tracked Set contract)
 *   - dashboard: persisted-signal-key-* (storage-key-specific)
 *   - server: no-undefined-sql-column (SQL string analysis — needs schema corpus)
 *   - server: no-unrouted-telemetry (plugin-api specific)
 *   - server: migration-guard-required (migrations-only; could universalize but no value)
 *
 * Everything else is universal. Each rule self-skips on irrelevant files.
 */

// classic LVI rules
const noDuplication = require("./eslint-rules/no-duplication.cjs");
const noCrossFileDuplication = require("./eslint-rules/no-cross-file-duplication.cjs");
const noUnusedVars = require("./eslint-rules/no-unused-vars.cjs");
const fileLimits = require("./eslint-rules/file-limits.cjs");
const folderLimits = require("./eslint-rules/folder-limits.cjs");
const namingConventions = require("./eslint-rules/naming-conventions.cjs");
const noRegex = require("./eslint-rules/no-regex.cjs");
const noComments = require("./eslint-rules/no-comments.cjs");
const noConsole = require("./eslint-rules/no-console.cjs");
const noTimerHeuristic = require("./eslint-rules/no-timer-heuristic.cjs");
const preferLookupTable = require("./eslint-rules/prefer-lookup-table.cjs");
const noMixedConcerns = require("./eslint-rules/no-mixed-concerns.cjs");
const maxParams = require("./eslint-rules/max-params.cjs");
const maxDepth = require("./eslint-rules/max-depth.cjs");
const maxLinesPerFunction = require("./eslint-rules/max-lines-per-function.cjs");
const noEmpty = require("./eslint-rules/no-empty.cjs");
const noMagicNumbers = require("./eslint-rules/no-magic-numbers.cjs");
const noWarningComments = require("./eslint-rules/no-warning-comments.cjs");
const noLeakShape = require("./eslint-rules/no-leak-shape.cjs");
const noEnvFallback = require("./eslint-rules/no-env-fallback.cjs");
const maxNameWords = require("./eslint-rules/max-name-words.cjs");
const iconNameLiteral = require("./eslint-rules/icon-name-literal.cjs");

// session-added rules
const aggregator = require("./eslint-rules/no-aggregator-god-class.cjs");
const prepareInLoop = require("./eslint-rules/no-prepare-in-loop.cjs");
const awaitInLoop = require("./eslint-rules/no-await-in-loop.cjs");
const broadCatch = require("./eslint-rules/no-broad-catch-swallow.cjs");
const syncIo = require("./eslint-rules/no-sync-io-handler.cjs");
const newRegex = require("./eslint-rules/no-new-regex-in-loop.cjs");
const redundantDateNow = require("./eslint-rules/no-redundant-date-now.cjs");
const unboundedCollection = require("./eslint-rules/no-unbounded-collection.cjs");
const floatingPromise = require("./eslint-rules/no-floating-promise.cjs");
const mutableSharedExport = require("./eslint-rules/no-mutable-shared-export.cjs");
const getDbInLoop = require("./eslint-rules/no-getdb-in-loop.cjs");
const arraySpreadReducer = require("./eslint-rules/no-array-spread-reducer.cjs");
const tightImportCycle = require("./eslint-rules/no-tight-import-cycle.cjs");
const jsonParseInLoop = require("./eslint-rules/no-json-parse-in-loop.cjs");
const stringConcatInLoop = require("./eslint-rules/no-string-concat-in-loop.cjs");
const findInLoop = require("./eslint-rules/no-find-in-loop.cjs");
const includesOnLargeArray = require("./eslint-rules/no-includes-on-large-array.cjs");
const sortInLoop = require("./eslint-rules/no-sort-in-loop.cjs");
const bufferConcatInLoop = require("./eslint-rules/no-buffer-concat-in-loop.cjs");
const deepCloneInLoop = require("./eslint-rules/no-deep-clone-in-loop.cjs");
const promiseAllWithoutLimit = require("./eslint-rules/no-promise-all-without-limit.cjs");
const eagerGlobalInit = require("./eslint-rules/no-eager-global-init.cjs");
const errorWithoutContext = require("./eslint-rules/no-error-without-context.cjs");
const monotonicIdViaDateNow = require("./eslint-rules/no-monotonic-id-via-date-now.cjs");
const blockingLoopWithoutYield = require("./eslint-rules/no-blocking-loop-without-yield.cjs");
const untypedAnyInHandler = require("./eslint-rules/no-untyped-any-in-handler.cjs");
const sharedThisAfterAwait = require("./eslint-rules/no-shared-this-after-await.cjs");
const implicitSingletonRace = require("./eslint-rules/no-implicit-singleton-race.cjs");
const cacheWithoutTtl = require("./eslint-rules/no-cache-without-ttl.cjs");
const handlerWithoutErrorResponse = require("./eslint-rules/no-handler-without-error-response.cjs");
const timeOfCheckTimeOfUse = require("./eslint-rules/no-time-of-check-time-of-use.cjs");
const truthyZeroCheck = require("./eslint-rules/no-truthy-zero-check.cjs");
const recursiveAsyncWithoutCap = require("./eslint-rules/no-recursive-async-without-cap.cjs");
const publicMutableGetter = require("./eslint-rules/no-public-mutable-getter.cjs");
const noUntrackedObserver = require("./eslint-rules/no-untracked-observer.cjs");
const managerNeedsBarrel = require("./eslint-rules/manager-needs-barrel.cjs");
const noHelpers = require("./eslint-rules/no-helpers.cjs");
const noUntrackedEncryption = require("./eslint-rules/no-untracked-encryption.cjs");
const noUntrackedPseudoRandom = require("./eslint-rules/no-untracked-pseudo-random.cjs");
const preferImmediateReturn = require("./eslint-rules/prefer-immediate-return.cjs");
const noReexportOutsideIndex = require("./eslint-rules/no-reexport-outside-index.cjs");
const noSelfAliasExport = require("./eslint-rules/no-self-alias-export.cjs");
const noRawIconClass = require("./eslint-rules/no-raw-icon-class.cjs");

const rules = {
    "no-duplication": noDuplication,
    "no-cross-file-duplication": noCrossFileDuplication,
    "no-unused-vars": noUnusedVars,
    "file-limits": fileLimits,
    "folder-limits": folderLimits,
    "naming-conventions": namingConventions,
    "no-regex": noRegex,
    "no-comments": noComments,
    "no-console": noConsole,
    "prefer-lookup-table": preferLookupTable,
    "no-mixed-concerns": noMixedConcerns,
    "max-params": maxParams,
    "max-depth": maxDepth,
    "max-lines-per-function": maxLinesPerFunction,
    "no-empty": noEmpty,
    "no-magic-numbers": noMagicNumbers,
    "no-warning-comments": noWarningComments,
    "no-leak-shape": noLeakShape,
    "no-env-fallback": noEnvFallback,
    "max-name-words": maxNameWords,
    "icon-name-literal": iconNameLiteral,
    "no-aggregator-god-class": aggregator,
    "no-prepare-in-loop": prepareInLoop,
    "no-await-in-loop": awaitInLoop,
    "no-broad-catch-swallow": broadCatch,
    "no-sync-io-handler": syncIo,
    "no-new-regex-in-loop": newRegex,
    "no-redundant-date-now": redundantDateNow,
    "no-unbounded-collection": unboundedCollection,
    "no-floating-promise": floatingPromise,
    "no-mutable-shared-export": mutableSharedExport,
    "no-getdb-in-loop": getDbInLoop,
    "no-array-spread-reducer": arraySpreadReducer,
    "no-tight-import-cycle": tightImportCycle,
    "no-json-parse-in-loop": jsonParseInLoop,
    "no-string-concat-in-loop": stringConcatInLoop,
    "no-find-in-loop": findInLoop,
    "no-includes-on-large-array": includesOnLargeArray,
    "no-sort-in-loop": sortInLoop,
    "no-buffer-concat-in-loop": bufferConcatInLoop,
    "no-deep-clone-in-loop": deepCloneInLoop,
    "no-promise-all-without-limit": promiseAllWithoutLimit,
    "no-eager-global-init": eagerGlobalInit,
    "no-error-without-context": errorWithoutContext,
    "no-monotonic-id-via-date-now": monotonicIdViaDateNow,
    "no-blocking-loop-without-yield": blockingLoopWithoutYield,
    "no-untyped-any-in-handler": untypedAnyInHandler,
    "no-shared-this-after-await": sharedThisAfterAwait,
    "no-implicit-singleton-race": implicitSingletonRace,
    "no-cache-without-ttl": cacheWithoutTtl,
    "no-handler-without-error-response": handlerWithoutErrorResponse,
    "no-time-of-check-time-of-use": timeOfCheckTimeOfUse,
    "no-truthy-zero-check": truthyZeroCheck,
    "no-recursive-async-without-cap": recursiveAsyncWithoutCap,
    "no-public-mutable-getter": publicMutableGetter,
    "no-untracked-observer": noUntrackedObserver,
    "manager-needs-barrel": managerNeedsBarrel,
    "no-helpers": noHelpers,
    "no-untracked-encryption": noUntrackedEncryption,
    "no-untracked-pseudo-random": noUntrackedPseudoRandom,
    "prefer-immediate-return": preferImmediateReturn,
    "no-reexport-outside-index": noReexportOutsideIndex,
    "no-self-alias-export": noSelfAliasExport,
    "no-raw-icon-class": noRawIconClass,
};

// Severities — rules without options just "error"; rules with options use array form.
const severities = {
    "lvi/no-duplication": "error",
    "lvi/no-cross-file-duplication": "error",
    "lvi/no-unused-vars": "error",
    "lvi/file-limits": ["error", { max: 150 }],
    "lvi/folder-limits": ["error", { max: 20 }],
    "lvi/naming-conventions": "error",
    "lvi/no-regex": "error",
    "lvi/no-comments": "error",
    "lvi/no-console": "error",
    "lvi/prefer-lookup-table": "error",
    "lvi/no-mixed-concerns": "error",
    "lvi/max-params": ["error", { max: 4 }],
    "lvi/max-depth": ["error", { max: 3 }],
    "lvi/max-lines-per-function": ["error", { max: 25, skipBlankLines: true, skipComments: true }],
    "lvi/no-empty": "error",
    "lvi/no-magic-numbers": ["error", { ignore: [-1, 0, 1, 2, 1024, 60_000, 300_000, 1_800_000], ignoreArrayIndexes: true, ignoreDefaultValues: true }],
    "lvi/no-warning-comments": ["error", { terms: ["todo", "fixme", "hack", "workaround", "stopship", "xxx", "deprecated", "legacy", "kept for", "for compat", "for backward", "previously", "formerly", "originally", "temporary", "shim", "stub for", "old impl"] }],
    "lvi/no-leak-shape": "error",
    "lvi/no-env-fallback": "error",
    "lvi/max-name-words": "error",
    "lvi/icon-name-literal": "error",
    "lvi/no-aggregator-god-class": "error",
    "lvi/no-prepare-in-loop": "error",
    "lvi/no-await-in-loop": "error",
    "lvi/no-broad-catch-swallow": "error",
    "lvi/no-sync-io-handler": "error",
    "lvi/no-new-regex-in-loop": "error",
    "lvi/no-redundant-date-now": "error",
    "lvi/no-unbounded-collection": "error",
    "lvi/no-floating-promise": "error",
    "lvi/no-mutable-shared-export": "error",
    "lvi/no-getdb-in-loop": "error",
    "lvi/no-array-spread-reducer": "error",
    "lvi/no-tight-import-cycle": "error",
    "lvi/no-json-parse-in-loop": "error",
    "lvi/no-string-concat-in-loop": "error",
    "lvi/no-find-in-loop": "error",
    "lvi/no-includes-on-large-array": "error",
    "lvi/no-sort-in-loop": "error",
    "lvi/no-buffer-concat-in-loop": "error",
    "lvi/no-deep-clone-in-loop": "error",
    "lvi/no-promise-all-without-limit": "error",
    "lvi/no-eager-global-init": "error",
    "lvi/no-error-without-context": "error",
    "lvi/no-monotonic-id-via-date-now": "error",
    "lvi/no-blocking-loop-without-yield": "error",
    "lvi/no-untyped-any-in-handler": "error",
    "lvi/no-shared-this-after-await": "error",
    "lvi/no-implicit-singleton-race": "error",
    "lvi/no-cache-without-ttl": "error",
    "lvi/no-handler-without-error-response": "error",
    "lvi/no-time-of-check-time-of-use": "error",
    "lvi/no-truthy-zero-check": "error",
    "lvi/no-recursive-async-without-cap": "error",
    "lvi/no-public-mutable-getter": "error",
    "lvi/no-untracked-observer": "error",
    "lvi/manager-needs-barrel": "error",
    "lvi/no-helpers": "error",
    "lvi/no-untracked-encryption": "error",
    "lvi/no-untracked-pseudo-random": "error",
    "lvi/prefer-immediate-return": "error",
    "lvi/no-reexport-outside-index": "error",
    "lvi/no-self-alias-export": "error",
    "lvi/no-raw-icon-class": "error",
};

module.exports = { rules, severities };
