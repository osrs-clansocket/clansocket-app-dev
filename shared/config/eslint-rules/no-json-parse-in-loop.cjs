/**
 * LVI/no-json-parse-in-loop — JSON.parse() inside a loop body. Hoist or pre-parse.
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

const LOOP_TYPES = new Set(["ForStatement", "ForInStatement", "ForOfStatement", "WhileStatement", "DoWhileStatement"]);
const LOOP_METHODS = new Set(["forEach", "map", "filter", "reduce", "reduceRight", "flatMap", "find", "findIndex", "some", "every"]);

function isInsideLoop(node) {
    let p = node.parent;
    while (p) {
        if (LOOP_TYPES.has(p.type)) return p;
        if (p.type === "CallExpression" && p.callee.type === "MemberExpression" && p.callee.property.type === "Identifier" && LOOP_METHODS.has(p.callee.property.name)) return p;
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
    meta: { type: "problem", docs: { description: "JSON.parse inside loop — hoist" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        return {
            CallExpression(node) {
                if (node.callee.type !== "MemberExpression") return;
                if (node.callee.object.type !== "Identifier" || node.callee.object.name !== "JSON") return;
                if (node.callee.property.type !== "Identifier" || node.callee.property.name !== "parse") return;
                const loop = isInsideLoop(node);
                if (!loop) return;
                // Per-iteration fresh source carve-out: `JSON.parse(load(...))` / `JSON.parse(await fetch(...))`.
                // Rule's intent ("Parse Once, Reuse Many") doesn't apply when the source genuinely
                // varies per iteration. A CallExpression / AwaitExpression argument signals "loaded
                // this iteration", not "constant we're re-parsing".
                const arg = node.arguments[0];
                if (arg && arg.type === "CallExpression") return;
                if (arg && arg.type === "AwaitExpression" && arg.argument && arg.argument.type === "CallExpression") return;
                const t = trace(node, raw, mod);
                const ctx = getContext(node);
                context.report({ node, messageId: "report", data: { report: build4DReport({
                    rule: "no-json-parse-in-loop",
                    narrative: `${file}:${node.loc.start.line} calls JSON.parse inside a ${loop.type} in ${ctx}. JSON parsing is CPU-bound and allocates; repeating it per iteration is wasted work when the source is loop-invariant or could be batch-parsed.`,
                    graph: {
                        X: `${file}:${node.loc.start.line} — JSON.parse inside ${loop.type}`,
                        Y: `parse cost × N; allocation pressure on the GC during hot iteration`,
                        Z: `Parse Once, Reuse Many — JSON.parse outputs are immutable from the parser's perspective`,
                        W: `wall-clock dominated by parse time; GC pauses lengthen as N grows`,
                    },
                    remediation: `Hoist before the loop: \`const parsed = JSON.parse(src);\`. If parsing per-row from DB, batch the query so each row is parsed once outside the iteration that consumes it. If the source genuinely varies per iteration (e.g. each row has its own JSON column), confirm the loop bound is small or accept the cost with a comment.`,
                    trace: t,
                }) } });
            },
        };
    },
};
