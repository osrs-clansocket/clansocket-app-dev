/**
 * LVI/no-n-plus-1 — DB read accessor inside a loop. Classic N+1 query pattern.
 * Hoist as a single batch query (IN(...) / JOIN / cache the per-key results).
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

const LOOP_TYPES = new Set(["ForStatement", "ForInStatement", "ForOfStatement", "WhileStatement", "DoWhileStatement"]);
const LOOP_METHODS = new Set(["forEach", "map", "filter", "reduce", "reduceRight", "flatMap", "find", "findIndex", "some", "every"]);
const ACCESSORS = new Set(["get", "all", "iterate"]);
const HELPER_FNS = new Set(["getOne", "getMany", "exists"]);

function isAccessor(node) {
    if (node.callee.type === "MemberExpression" && node.callee.property.type === "Identifier") {
        return ACCESSORS.has(node.callee.property.name);
    }
    if (node.callee.type === "Identifier") return HELPER_FNS.has(node.callee.name);
    return false;
}

function isInsideLoop(node) {
    let p = node.parent;
    while (p) {
        if (LOOP_TYPES.has(p.type)) return p;
        if (
            p.type === "CallExpression" &&
            p.callee.type === "MemberExpression" &&
            p.callee.property.type === "Identifier" &&
            LOOP_METHODS.has(p.callee.property.name)
        ) return p;
        if (p.type === "FunctionDeclaration" || p.type === "FunctionExpression" || p.type === "ArrowFunctionExpression") {
            const g = p.parent;
            if (g && g.type === "CallExpression" && g.callee.type === "MemberExpression" && g.callee.property.type === "Identifier" && LOOP_METHODS.has(g.callee.property.name)) return g;
            return null;
        }
        p = p.parent;
    }
    return null;
}

module.exports = {
    meta: { type: "problem", docs: { description: "DB read accessor inside loop — N+1" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        return {
            CallExpression(node) {
                if (!isAccessor(node)) return;
                const loop = isInsideLoop(node);
                if (!loop) return;
                const t = trace(node, raw, mod);
                const ctx = getContext(node);
                context.report({ node, messageId: "report", data: { report: build4DReport({
                    rule: "no-n-plus-1",
                    narrative: `${file}:${node.loc.start.line} performs a DB read inside a loop in ${ctx}. Each iteration round-trips to SQLite; total queries = N. Batch with WHERE col IN (...) or JOIN, or pre-fetch into a Map.`,
                    graph: {
                        X: `${file}:${node.loc.start.line} — read inside ${loop.type}`,
                        Y: `latency = N × per-query cost; locking contention scales with iteration count`,
                        Z: `Batch What Iterates — N queries become 1 when keys are known upfront`,
                        W: `as N grows the loop pegs CPU + holds locks; cascading slowdown when other transactions wait`,
                    },
                    remediation: `Replace with: (1) batched IN-clause: \`db.prepare(\\\`SELECT ... WHERE id IN (\${placeholders(ids.length)})\\\`).all(...ids)\`; (2) JOIN to the parent table when the iteration is over parent rows; (3) pre-fetch into a Map then iterate the in-memory map. The original loop body becomes a Map.get() instead of a DB call.`,
                    trace: t,
                }) } });
            },
        };
    },
};
