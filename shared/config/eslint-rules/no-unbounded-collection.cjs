/**
 * LVI/no-unbounded-collection — module-level Map/Set/Array that gets .push/.set/.add
 * calls but never .delete/.shift/.clear/.pop. Memory leak compounds over server uptime.
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

const ADD_METHODS = new Set(["push", "set", "add", "unshift"]);
const REMOVE_METHODS = new Set(["delete", "shift", "clear", "pop", "splice"]);

function isModuleScope(node) {
    let p = node.parent;
    while (p) {
        if (p.type === "FunctionDeclaration" || p.type === "FunctionExpression" || p.type === "ArrowFunctionExpression" || p.type === "ClassBody") return false;
        if (p.type === "Program") return true;
        p = p.parent;
    }
    return false;
}

function collectionType(init) {
    if (!init) return null;
    if (init.type === "ArrayExpression") return "Array";
    if (init.type === "NewExpression" && init.callee.type === "Identifier") {
        // WeakMap/WeakSet auto-evict on key GC — the bounded behavior is intrinsic.
        if (init.callee.name === "Map" || init.callee.name === "Set") return init.callee.name;
    }
    return null;
}

function isRegistryPath(raw) {
    // `<name>-registry.ts` / `registry.ts` / `registries.ts` filename, OR any file in a
    // `registries/` folder. Registries are bounded-by-registration — entries land at boot
    // via side-effect imports, not at runtime via user input.
    return /-registry\.ts$/.test(raw) || /\/registr(y|ies)\.ts$/.test(raw) || /\/registries\//.test(raw);
}

module.exports = {
    meta: { type: "problem", docs: { description: "Module-level collection with add but no remove" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        if (isRegistryPath(raw)) return {};
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        const collections = new Map(); // name → { node, type, adds: 0, removes: 0 }
        let fileHasRemoveCall = false;
        return {
            VariableDeclarator(node) {
                if (!isModuleScope(node)) return;
                if (node.id.type !== "Identifier") return;
                const t = collectionType(node.init);
                if (!t) return;
                collections.set(node.id.name, { node, type: t, adds: 0, removes: 0 });
            },
            CallExpression(node) {
                if (node.callee.type !== "MemberExpression") return;
                if (node.callee.property.type !== "Identifier") return;
                const method = node.callee.property.name;
                if (REMOVE_METHODS.has(method)) fileHasRemoveCall = true;
                if (node.callee.object.type !== "Identifier") return;
                const name = node.callee.object.name;
                if (!collections.has(name)) return;
                const c = collections.get(name);
                if (ADD_METHODS.has(method)) c.adds++;
                else if (REMOVE_METHODS.has(method)) c.removes++;
            },
            "Program:exit"() {
                if (fileHasRemoveCall) return;
                for (const [name, c] of collections) {
                    if (c.adds === 0) continue;
                    if (c.removes > 0) continue;
                    const t = trace(c.node, raw, mod);
                    const ctx = getContext(c.node);
                    context.report({ node: c.node, messageId: "report", data: { report: build4DReport({
                        rule: "no-unbounded-collection",
                        narrative: `${file}:${c.node.loc.start.line} declares module-level ${c.type} '${name}' that grows (${c.adds} add-calls detected) but is never shrunk (no delete/shift/clear/pop). Server-lifetime memory leak.`,
                        graph: {
                            X: `${file}:${c.node.loc.start.line} — '${name}' is a ${c.type} with adds but no removes`,
                            Y: `every add accumulates; live heap monotonically increases for as long as the process runs`,
                            Z: `Bounded State Or No State — module-level mutable collections must declare an eviction policy`,
                            W: `OOM-killer eventually reaps the process; service degrades over days/weeks; restarts mask the bug temporarily`,
                        },
                        remediation: `Choose one: (1) add explicit eviction (TTL + periodic sweep, LRU cap, on-event delete); (2) move to function-local scope if the collection isn't supposed to survive across calls; (3) if it's a registry that genuinely never shrinks (e.g. compiled-once event types), add a comment explaining why and ensure adds are also one-shot at module load.`,
                        trace: t,
                    }) } });
                }
            },
        };
    },
};
