/**
 * LVI/no-new-regex-in-loop — `new RegExp(...)` (or /lit/.compile alternatives) inside a loop.
 * Hoist the compiled regex out so it compiles once.
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
    meta: { type: "problem", docs: { description: "new RegExp() inside loop — hoist the compile" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        return {
            NewExpression(node) {
                if (node.callee.type !== "Identifier" || node.callee.name !== "RegExp") return;
                const loop = isInsideLoop(node);
                if (!loop) return;
                const t = trace(node, raw, mod);
                const ctx = getContext(node);
                context.report({ node, messageId: "report", data: { report: build4DReport({
                    rule: "no-new-regex-in-loop",
                    narrative: `${file}:${node.loc.start.line} constructs a new RegExp inside a loop in ${ctx}. Regex compilation is non-trivial; rebuilding the same pattern N times wastes CPU.`,
                    graph: {
                        X: `${file}:${node.loc.start.line} — new RegExp inside ${loop.type}`,
                        Y: `compile cost paid N times; iteration body slowed by parse + DFA construction every pass`,
                        Z: `Compile Once, Match Many — RegExp objects are immutable and reusable`,
                        W: `pattern-heavy loops (parsing, validation) become 5-10× slower than necessary`,
                    },
                    remediation: `Hoist to module-level const or to the outer function scope: \`const RX = /pattern/g;\` then use RX.test(x) or x.match(RX) inside the loop. If the pattern depends on a loop-bound value, pre-build a Map<key, RegExp> outside the loop.`,
                    trace: t,
                }) } });
            },
        };
    },
};
