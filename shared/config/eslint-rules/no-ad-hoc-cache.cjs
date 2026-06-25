/**
 * LVI/no-ad-hoc-cache — Map/WeakMap/Set/WeakSet declarations with cache-shape
 * naming must use the central cache primitives (BoundedCache, AsyncMemoCache,
 * WeakRefCache, memoize) from state/caches/.
 *
 * Caught:
 *   const fooCache = new Map(...)
 *   private inflightMap = new Map<...>(...)
 *   this.memoLookup = new WeakMap(...)
 *   const pendingRequests = new Set(...)
 *
 * NOT caught:
 *   const labels = new Map([...])           // not cache-shape naming
 *   const visited = new Set<string>(...)    // generic-purpose Set
 *
 * The naming heuristic is liberal: any identifier matching
 * /cache|memo|inflight|pending|lru|fifo/i triggers. Genuine non-cache Maps
 * that happen to match the regex go through the exclusions allowlist.
 *
 * Pre-existing scattered usages are exempted via no-ad-hoc-cache.exclusions.cjs
 * with documented reasons. New code must use the primitives.
 */

const path = require("path");

const RAW_EXCLUSIONS = require("./no-ad-hoc-cache.exclusions.cjs");
const EXCLUSION_PATHS = new Set(
    RAW_EXCLUSIONS.map((entry) => entry.file.split("\\").join("/").replace(/\/+$/, "")),
);

// The cache primitives themselves live here — they ARE the Maps the rule
// is steering callers toward, so they're exempt by location.
const CACHE_IMPL_FOLDER = "main/dashboard/src/state/caches/";

// Match the cache term at the END of the identifier (case-insensitive). This
// catches cache-shape names like `imageCache`, `pathCache`, `seoCache`,
// `glyphCache`, `pathInflight` while avoiding false positives on prefix-
// shape names like `memoSubs` (reactive substrate, NOT a cache) or
// `pendingChanged` (state coordination, NOT a cache). Cache-shape variables
// idiomatically have the type as a suffix.
const CACHE_NAMING = /(?:cache|memo|inflight|pending|lru|fifo)$/i;
const TRACKED_CTORS = new Set(["Map", "WeakMap", "Set", "WeakSet"]);

function isExemptByPath(normPath) {
    if (normPath.includes(CACHE_IMPL_FOLDER)) return true;
    for (const exempt of EXCLUSION_PATHS) {
        if (normPath.endsWith(exempt)) return true;
    }
    return false;
}

function nameFromContext(node) {
    const parent = node.parent;
    if (!parent) return null;
    if (parent.type === "VariableDeclarator" && parent.id && parent.id.type === "Identifier") {
        return parent.id.name;
    }
    if (parent.type === "PropertyDefinition" && parent.key && parent.key.type === "Identifier") {
        return parent.key.name;
    }
    if (parent.type === "AssignmentExpression" && parent.left) {
        const left = parent.left;
        if (left.type === "MemberExpression" && left.property && left.property.type === "Identifier") {
            return left.property.name;
        }
        if (left.type === "Identifier") return left.name;
    }
    if (parent.type === "Property" && parent.key && parent.key.type === "Identifier") {
        return parent.key.name;
    }
    return null;
}

module.exports = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Map/WeakMap/Set/WeakSet with cache-shape naming must use BoundedCache/AsyncMemoCache/WeakRefCache/memoize from state/caches/.",
        },
        schema: [],
        messages: {
            adhoc:
                "Ad-hoc {{ctor}} with cache-shape naming '{{name}}' bypasses the cache chokepoint. Use BoundedCache/AsyncMemoCache/WeakRefCache from state/caches/ (or memoize() for pure-function memoization). This ensures bounded eviction + tag-based flush + metrics.",
        },
    },
    create(context) {
        const raw = (context.filename || context.getFilename()).split("\\").join("/");
        if (isExemptByPath(raw)) return {};
        return {
            NewExpression(node) {
                const callee = node.callee;
                if (!callee || callee.type !== "Identifier") return;
                if (!TRACKED_CTORS.has(callee.name)) return;
                const name = nameFromContext(node);
                if (name === null || !CACHE_NAMING.test(name)) return;
                context.report({
                    node,
                    messageId: "adhoc",
                    data: { ctor: callee.name, name },
                });
            },
        };
    },
};
