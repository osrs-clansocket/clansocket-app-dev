/**
 * LVI/no-prepare-in-loop — db.prepare() inside loop body is a hot-path bug.
 * Each iteration re-parses + re-binds the SQL. Hoist the prepare outside the loop.
 *
 * Detects:
 *   - .prepare(...) calls whose innermost enclosing loop is in the same function
 *   - Loops: ForStatement, ForInStatement, ForOfStatement, WhileStatement, DoWhileStatement
 *   - Array method callbacks: .forEach/.map/.filter/.reduce/.flatMap/.find/.some/.every
 *
 * Skips:
 *   - prepare() at module top level (one-shot)
 *   - prepare() inside conditional that's inside a loop is still flagged
 *   - prepare() inside try/catch inside loop is still flagged
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

const LOOP_TYPES = new Set([
    "ForStatement",
    "ForInStatement",
    "ForOfStatement",
    "WhileStatement",
    "DoWhileStatement",
]);

const LOOP_METHODS = new Set([
    "forEach", "map", "filter", "reduce", "reduceRight",
    "flatMap", "find", "findIndex", "some", "every",
]);

function isPrepareCall(node) {
    if (node.callee.type !== "MemberExpression") return false;
    if (node.callee.property.type !== "Identifier") return false;
    return node.callee.property.name === "prepare";
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
        ) {
            // Check if the current ancestor chain passed through a function arg of this call
            return p;
        }
        if (p.type === "FunctionDeclaration" || p.type === "FunctionExpression" || p.type === "ArrowFunctionExpression") {
            // Function boundary — only count it as a loop if the function itself is the callback of a loop-method
            const grand = p.parent;
            if (
                grand &&
                grand.type === "CallExpression" &&
                grand.callee.type === "MemberExpression" &&
                grand.callee.property.type === "Identifier" &&
                LOOP_METHODS.has(grand.callee.property.name)
            ) {
                return grand;
            }
            return null;
        }
        p = p.parent;
    }
    return null;
}

module.exports = {
    meta: {
        type: "problem",
        docs: { description: "db.prepare() must not be called inside loops — hoist it out" },
        schema: [],
        messages: { report: "{{ report }}" },
    },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        return {
            CallExpression(node) {
                if (!isPrepareCall(node)) return;
                const loop = isInsideLoop(node);
                if (!loop) return;
                const t = trace(node, raw, mod);
                const ctx = getContext(node);
                context.report({
                    node,
                    messageId: "report",
                    data: {
                        report: build4DReport({
                            rule: "no-prepare-in-loop",
                            narrative: `${file}:${node.loc.start.line} calls .prepare(...) inside a loop in ${ctx}. SQLite re-parses + re-binds the statement every iteration; for N rows this is O(N) wasted parse work + O(N) lost prepared-statement-cache benefit. Hoist the prepare(s) out of the loop.`,
                            graph: {
                                X: `${file}:${node.loc.start.line} — .prepare(...) inside loop (enclosing ${loop.type})`,
                                Y: `each call site multiplies cost by iteration count → loop-bound work that doesn't need to be loop-bound`,
                                Z: `Constant Work Outside Loop principle — hoisting invariants is the cheapest optimization`,
                                W: `as data scales the per-iteration prepare cost dominates; query latency climbs linearly with row count even when individual queries are cheap`,
                            },
                            remediation: `Move prepare() before the loop and reuse the statement: \`const stmt = db.prepare("..."); for (const x of items) stmt.run(x);\`. If the SQL string itself varies (e.g. table name interpolation), build the prepared statements once at the outer scope: \`const prepared = TABLES.map((t) => db.prepare(\\\`UPDATE \${t} ...\\\`));\` then iterate the prepared array.`,
                            trace: t,
                        }),
                    },
                });
            },
        };
    },
};
