/**
 * LVI/no-array-spread-reducer — `[...acc, x]` inside a reduce callback. Each iteration
 * allocates a new array of length-N → O(N²) total work. Use acc.push(x) or a Map/Set.
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

function isReduceCallback(node) {
    let p = node.parent;
    while (p) {
        if (p.type === "CallExpression" && p.callee.type === "MemberExpression" && p.callee.property.type === "Identifier") {
            if (p.callee.property.name === "reduce" || p.callee.property.name === "reduceRight") return p;
        }
        if (p.type === "FunctionDeclaration") return null;
        p = p.parent;
    }
    return null;
}

function isSpreadAccArray(node) {
    if (node.type !== "ArrayExpression") return false;
    return node.elements.some((e) => e && e.type === "SpreadElement");
}

module.exports = {
    meta: { type: "problem", docs: { description: "[...acc, x] in reduce — O(N²)" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        return {
            ArrayExpression(node) {
                if (!isSpreadAccArray(node)) return;
                const reduce = isReduceCallback(node);
                if (!reduce) return;
                const t = trace(node, raw, mod);
                const ctx = getContext(node);
                context.report({ node, messageId: "report", data: { report: build4DReport({
                    rule: "no-array-spread-reducer",
                    narrative: `${file}:${node.loc.start.line} spreads an accumulator into a new array inside a reduce callback in ${ctx}. Each iteration copies the entire accumulator → O(N²) total. For N=1000 that's a million ops where a thousand suffice.`,
                    graph: {
                        X: `${file}:${node.loc.start.line} — \`[...acc, ...]\` inside reduce/reduceRight`,
                        Y: `per-iteration cost grows linearly with accumulator length; total work is quadratic`,
                        Z: `Reducers Should Be O(1) Per Step — accumulator mutation, not copy, is the canonical pattern when output is a list`,
                        W: `for small N nobody notices; for N=10k the reducer becomes the hottest line in a profile`,
                    },
                    remediation: `Replace \`(acc, x) => [...acc, x]\` with \`(acc, x) => { acc.push(x); return acc; }\`. If immutability matters, use Array.from(items) + manual filter instead of reduce, or pre-allocate the output. For Object accumulators with spread: same story with \`Object.assign(acc, {...})\` → use direct assignment.`,
                    trace: t,
                }) } });
            },
        };
    },
};
