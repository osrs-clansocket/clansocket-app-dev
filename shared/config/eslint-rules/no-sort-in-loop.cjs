/**
 * LVI/no-sort-in-loop — Array.sort inside a loop body. Sort cost × loop count.
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

const LOOP_TYPES = new Set(["ForStatement", "ForInStatement", "ForOfStatement", "WhileStatement", "DoWhileStatement"]);

function isInsideLoopBody(node) {
    let prev = node;
    let p = node.parent;
    while (p) {
        if (LOOP_TYPES.has(p.type)) {
            // Setup expressions (init/test/update/right/left) are evaluated outside the body
            // loop iteration cost. Only flag when the sort is inside the body itself.
            if (prev === p.init || prev === p.test || prev === p.update) return null;
            if (prev === p.right || prev === p.left) return null;
            return p;
        }
        if (p.type === "FunctionDeclaration" || p.type === "FunctionExpression" || p.type === "ArrowFunctionExpression") return null;
        prev = p;
        p = p.parent;
    }
    return null;
}

module.exports = {
    meta: { type: "problem", docs: { description: "Array.sort inside loop" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        return {
            CallExpression(node) {
                if (node.callee.type !== "MemberExpression") return;
                if (node.callee.property.type !== "Identifier" || node.callee.property.name !== "sort") return;
                const loop = isInsideLoopBody(node);
                if (!loop) return;
                const t = trace(node, raw, mod);
                const ctx = getContext(node);
                context.report({ node, messageId: "report", data: { report: build4DReport({
                    rule: "no-sort-in-loop",
                    narrative: `${file}:${node.loc.start.line} calls .sort() inside a ${loop.type} in ${ctx}. Sort is O(N log N); doing it per iteration multiplies the cost by the loop count.`,
                    graph: {
                        X: `${file}:${node.loc.start.line} — .sort() inside ${loop.type}`,
                        Y: `per-iteration sort × loop count = O(K × N log N) where K is iterations`,
                        Z: `Sort Once, Iterate Many — sorted state is loop-invariant once the data is fixed`,
                        W: `pagination + sorting hybrids show this pattern; ranking calculations done per page get N×P cost`,
                    },
                    remediation: `Hoist the sort before the loop. If the sort key depends on the loop variable (rare), restructure: sort once by a stable key, then filter inside the loop.`,
                    trace: t,
                }) } });
            },
        };
    },
};
