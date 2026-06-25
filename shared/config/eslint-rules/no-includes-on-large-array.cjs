/**
 * LVI/no-includes-on-large-array — `.includes(x)` on a const array of >=5 items.
 * Convert to a module-level Set for O(1) membership.
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

const THRESHOLD = 5;

module.exports = {
    meta: { type: "problem", docs: { description: ".includes() on large const array — use Set" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        const constArrays = new Map();
        return {
            VariableDeclarator(node) {
                if (node.init && node.init.type === "ArrayExpression" && node.id.type === "Identifier") {
                    if (node.init.elements.length >= THRESHOLD) constArrays.set(node.id.name, { size: node.init.elements.length });
                }
            },
            CallExpression(node) {
                if (node.callee.type !== "MemberExpression") return;
                if (node.callee.property.type !== "Identifier" || node.callee.property.name !== "includes") return;
                if (node.callee.object.type !== "Identifier") return;
                const info = constArrays.get(node.callee.object.name);
                if (!info) return;
                const t = trace(node, raw, mod);
                const ctx = getContext(node);
                context.report({ node, messageId: "report", data: { report: build4DReport({
                    rule: "no-includes-on-large-array",
                    narrative: `${file}:${node.loc.start.line} calls .includes() on '${node.callee.object.name}' which is a const Array of ${info.size} items in ${ctx}. .includes() is O(N); Set.has is O(1). For hot paths this is a free 5-10× speedup.`,
                    graph: {
                        X: `${file}:${node.loc.start.line} — .includes() on ${info.size}-element const array`,
                        Y: `each lookup scans the array linearly; in hot paths the scan dominates`,
                        Z: `Membership Is A Set Operation — arrays are for iteration order, Sets for membership`,
                        W: `as the const array grows over time, lookup cost grows silently; nobody profiles a simple .includes()`,
                    },
                    remediation: `Replace with: \`const ${node.callee.object.name}_SET: ReadonlySet<...> = new Set([...${node.callee.object.name}]);\` then \`${node.callee.object.name}_SET.has(x)\`. If iteration order is also needed, keep the array AND a parallel Set indexed by membership key.`,
                    trace: t,
                }) } });
            },
        };
    },
};
