/**
 * LVI/no-buffer-concat-in-loop — Buffer.concat([acc, next]) inside a loop. O(N²) memory.
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

module.exports = {
    meta: { type: "problem", docs: { description: "Buffer.concat in loop — O(N²)" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        return {
            CallExpression(node) {
                if (node.callee.type !== "MemberExpression") return;
                if (node.callee.object.type !== "Identifier" || node.callee.object.name !== "Buffer") return;
                if (node.callee.property.type !== "Identifier" || node.callee.property.name !== "concat") return;
                const loop = isInsideLoop(node);
                if (!loop) return;
                const t = trace(node, raw, mod);
                const ctx = getContext(node);
                context.report({ node, messageId: "report", data: { report: build4DReport({
                    rule: "no-buffer-concat-in-loop",
                    narrative: `${file}:${node.loc.start.line} calls Buffer.concat inside a ${loop.type} in ${ctx}. Each call allocates a new Buffer of total-length-so-far → O(N²) total bytes copied.`,
                    graph: {
                        X: `${file}:${node.loc.start.line} — Buffer.concat inside ${loop.type}`,
                        Y: `every iteration copies all previous bytes; memory bandwidth becomes the bottleneck`,
                        Z: `Collect Then Concat Once — N-element concat is O(N) once, O(N²) when streamed`,
                        W: `streaming-style buffer assembly under load: latency climbs with payload size; GC pressure spikes`,
                    },
                    remediation: `Collect into an array first: \`const parts: Buffer[] = []; for (...) parts.push(next); const result = Buffer.concat(parts);\`. Or use a Writable stream / yazl-style streaming if the consumer can accept chunks.`,
                    trace: t,
                }) } });
            },
        };
    },
};
