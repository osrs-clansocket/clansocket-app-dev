/**
 * LVI/no-deep-clone-in-loop — structuredClone or JSON.parse(JSON.stringify(...)) inside a loop.
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

const LOOP_TYPES = new Set(["ForStatement", "ForInStatement", "ForOfStatement", "WhileStatement", "DoWhileStatement"]);

function isInsideLoop(node) {
    let p = node.parent;
    while (p) {
        if (LOOP_TYPES.has(p.type)) return p;
        if (p.type === "FunctionDeclaration" || p.type === "FunctionExpression" || p.type === "ArrowFunctionExpression") return null;
        p = p.parent;
    }
    return null;
}

function isStructuredClone(node) {
    return node.callee.type === "Identifier" && node.callee.name === "structuredClone";
}

function isJsonClonePattern(node) {
    if (node.callee.type !== "MemberExpression") return false;
    if (node.callee.object.type !== "Identifier" || node.callee.object.name !== "JSON") return false;
    if (node.callee.property.type !== "Identifier" || node.callee.property.name !== "parse") return false;
    const arg = node.arguments[0];
    if (!arg || arg.type !== "CallExpression") return false;
    if (arg.callee.type !== "MemberExpression") return false;
    if (arg.callee.object.type !== "Identifier" || arg.callee.object.name !== "JSON") return false;
    return arg.callee.property.type === "Identifier" && arg.callee.property.name === "stringify";
}

module.exports = {
    meta: { type: "problem", docs: { description: "Deep clone inside loop" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        return {
            CallExpression(node) {
                if (!isStructuredClone(node) && !isJsonClonePattern(node)) return;
                const loop = isInsideLoop(node);
                if (!loop) return;
                const kind = isStructuredClone(node) ? "structuredClone" : "JSON.parse(JSON.stringify(...))";
                const t = trace(node, raw, mod);
                const ctx = getContext(node);
                context.report({ node, messageId: "report", data: { report: build4DReport({
                    rule: "no-deep-clone-in-loop",
                    narrative: `${file}:${node.loc.start.line} performs a deep clone (${kind}) inside a ${loop.type} in ${ctx}. Deep clone is expensive (traversal + alloc + GC); doing it per iteration scales linearly with both loop count AND object size.`,
                    graph: {
                        X: `${file}:${node.loc.start.line} — ${kind} inside ${loop.type}`,
                        Y: `per-iteration cost = O(object size); total = O(iter × size)`,
                        Z: `Clone Only When Mutation Is Coming — read-only access doesn't need a clone`,
                        W: `defensive cloning pattern hides the cost until the object grows; latency climbs invisibly`,
                    },
                    remediation: `Choose: (1) if you don't mutate, drop the clone entirely (use the original); (2) if you need a shallow copy of a known shape, use \`{...obj}\` or \`[...arr]\` (much cheaper); (3) if mutation is intentional, clone ONCE outside the loop and reuse the clone.`,
                    trace: t,
                }) } });
            },
        };
    },
};
