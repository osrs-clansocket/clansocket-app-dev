/**
 * LVI/no-cache-without-ttl — module-level Map/Set named *cache/registry/store/by/map* with
 * .set/.add calls but no setInterval/setTimeout/expiry/sweep nearby. Becomes a memory leak.
 *
 * Stricter version of no-unbounded-collection: targets cache-named identifiers specifically,
 * because semantics ("this is a cache") imply expiry was intended but forgotten.
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

const CACHE_HINT_RE = /[Cc]ache|[Rr]egistry|[Ss]tore$|[Bb]uckets?$|[Pp]ool$|[Ii]ndex$|[Bb]y[A-Z]|[Mm]emo/;

function isModuleScope(node) {
    let p = node.parent;
    while (p) {
        if (p.type === "FunctionDeclaration" || p.type === "FunctionExpression" || p.type === "ArrowFunctionExpression" || p.type === "ClassBody") return false;
        if (p.type === "Program") return true;
        p = p.parent;
    }
    return false;
}

function isCacheLike(init) {
    if (!init) return null;
    // WeakMap/WeakSet auto-evict on key GC — the bounded behavior is intrinsic.
    if (init.type === "NewExpression" && init.callee.type === "Identifier" && ["Map", "Set"].includes(init.callee.name)) return init.callee.name;
    if (init.type === "ObjectExpression" && init.properties.length === 0) return "Object";
    return null;
}

// Registries are bounded-by-registration — entries land at boot via side-effect imports,
// not at runtime via user input. Matches no-unbounded-collection's same carve-out.
function isRegistryPath(raw) {
    return /-registry\.ts$/.test(raw) || /\/registr(y|ies)\.ts$/.test(raw) || /\/registries\//.test(raw);
}

module.exports = {
    meta: { type: "problem", docs: { description: "Module-level cache without TTL/eviction" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        if (isRegistryPath(raw)) return {};
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        const caches = new Map();
        let sawExpiryMechanism = false;
        return {
            VariableDeclarator(node) {
                if (!isModuleScope(node)) return;
                if (node.id.type !== "Identifier") return;
                if (!CACHE_HINT_RE.test(node.id.name)) return;
                const t = isCacheLike(node.init);
                if (!t) return;
                caches.set(node.id.name, { node, type: t, adds: 0, removes: 0 });
            },
            CallExpression(node) {
                if (node.callee.type === "Identifier") {
                    if (["setInterval", "setTimeout"].includes(node.callee.name)) sawExpiryMechanism = true;
                }
                if (node.callee.type === "MemberExpression" && node.callee.object.type === "Identifier") {
                    if (!caches.has(node.callee.object.name)) return;
                    const c = caches.get(node.callee.object.name);
                    if (node.callee.property.type !== "Identifier") return;
                    const m = node.callee.property.name;
                    if (["set", "add", "push"].includes(m)) c.adds++;
                    else if (["delete", "clear", "shift", "pop"].includes(m)) c.removes++;
                }
            },
            "Program:exit"() {
                for (const [name, c] of caches) {
                    if (c.adds === 0) continue;
                    if (c.removes > 0) continue;
                    if (sawExpiryMechanism) continue;
                    const t = trace(c.node, raw, mod);
                    const ctx = getContext(c.node);
                    context.report({ node: c.node, messageId: "report", data: { report: build4DReport({
                        rule: "no-cache-without-ttl",
                        narrative: `${file}:${c.node.loc.start.line} declares '${name}' (a ${c.type} with cache-like naming) at module scope. Adds are tracked but there's no eviction (no delete/clear) and no expiry mechanism (no setInterval/setTimeout sweep) in this file. Cache semantics imply bounded lifetime — without it, this is a slow memory leak shaped like a cache.`,
                        graph: {
                            X: `${file}:${c.node.loc.start.line} — cache-named '${name}' has adds but no evict + no expiry`,
                            Y: `every cache insert is permanent; memory grows monotonically with request volume`,
                            Z: `Caches Must Have A Bound — TTL, LRU cap, on-event invalidation; one of those, picked deliberately`,
                            W: `OOM after long uptime; mysterious memory growth pattern; restart 'fixes' the issue temporarily and masks the cause`,
                        },
                        remediation: `Pick a bound: (1) LRU cap with eviction on .set when size > N; (2) periodic sweep \`setInterval(() => sweepExpired(), MS_PER_HOUR)\` reading a TTL field; (3) invalidate on a specific event (when underlying data changes). A "cache" without bound is just a leak.`,
                        trace: t,
                    }) } });
                }
            },
        };
    },
};
