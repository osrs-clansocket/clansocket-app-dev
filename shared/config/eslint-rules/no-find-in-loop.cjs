/**
 * LVI/no-find-in-loop — Array.find / indexOf inside a loop body. O(N×M).
 * Pre-index the lookup collection into a Map for O(1) lookup.
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

const LOOP_TYPES = new Set(["ForStatement", "ForInStatement", "ForOfStatement", "WhileStatement", "DoWhileStatement"]);
const LOOKUP_METHODS = new Set(["find", "findIndex", "indexOf", "lastIndexOf", "findLast", "findLastIndex"]);
const STRING_INDEX_OF = new Set(["indexOf", "lastIndexOf"]);

function isStringParseCall(node) {
    // `.indexOf("delim")` / `.indexOf("\n", cursor)` — string-search idiom for parser cursors.
    // Array.indexOf with a static-literal needle is unusual; string.indexOf with one is canonical.
    if (!STRING_INDEX_OF.has(node.callee.property.name)) return false;
    const arg = node.arguments[0];
    if (!arg) return false;
    // Literal string OR Identifier reference (likely an upper-cased constant like DELIMITER).
    if (arg.type === "Literal" && typeof arg.value === "string") return true;
    if (arg.type === "Identifier" && /^[A-Z][A-Z0-9_]*$/.test(arg.name)) return true;
    return false;
}

// Streaming-consumer loop: `while (idx !== -1) { ...; idx = buf.indexOf(D); }`. The buffer
// shrinks each iteration so total cost is O(N) over the buffer, not O(N×M). Test condition
// matches `<x> !== -1` / `<x> >= 0` / `<x> > -1`.
function isMinusOne(node) {
    if (!node) return false;
    if (node.type === "UnaryExpression" && node.operator === "-" && node.argument && node.argument.type === "Literal" && node.argument.value === 1) return true;
    if (node.type === "Literal" && node.value === -1) return true;
    return false;
}

function testIsMatchPresent(test) {
    if (!test || test.type !== "BinaryExpression") return false;
    if (test.operator === "!==" || test.operator === "!=") return isMinusOne(test.right) || isMinusOne(test.left);
    if (test.operator === ">=") return test.right && test.right.type === "Literal" && test.right.value === 0;
    if (test.operator === ">") return isMinusOne(test.right);
    return false;
}

function isStreamingConsumerLoop(loop, methodName) {
    if (!STRING_INDEX_OF.has(methodName)) return false;
    if (loop.type !== "WhileStatement" && loop.type !== "DoWhileStatement" && loop.type !== "ForStatement") return false;
    return testIsMatchPresent(loop.test);
}

function isInsideLoop(node) {
    let p = node.parent;
    while (p) {
        if (LOOP_TYPES.has(p.type)) return p;
        if (p.type === "FunctionDeclaration" || p.type === "FunctionExpression" || p.type === "ArrowFunctionExpression") {
            const g = p.parent;
            if (g && g.type === "CallExpression" && g.callee.type === "MemberExpression" && g.callee.property.type === "Identifier" && ["forEach", "map", "filter", "reduce", "flatMap"].includes(g.callee.property.name)) return g;
            return null;
        }
        p = p.parent;
    }
    return null;
}

module.exports = {
    meta: { type: "problem", docs: { description: "linear search inside loop — O(N×M)" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        return {
            CallExpression(node) {
                if (node.callee.type !== "MemberExpression") return;
                if (node.callee.property.type !== "Identifier") return;
                if (!LOOKUP_METHODS.has(node.callee.property.name)) return;
                if (isStringParseCall(node)) return;
                const loop = isInsideLoop(node);
                if (!loop) return;
                if (isStreamingConsumerLoop(loop, node.callee.property.name)) return;
                const t = trace(node, raw, mod);
                const ctx = getContext(node);
                context.report({ node, messageId: "report", data: { report: build4DReport({
                    rule: "no-find-in-loop",
                    narrative: `${file}:${node.loc.start.line} calls .${node.callee.property.name}() inside a loop in ${ctx}. Linear search × loop iterations = O(N×M). For N=100, M=100 that's 10k ops; convert to Map for 200 ops total.`,
                    graph: {
                        X: `${file}:${node.loc.start.line} — .${node.callee.property.name}() inside ${loop.type}`,
                        Y: `each iteration scans the entire lookup array; total cost grows multiplicatively`,
                        Z: `Index Once, Lookup O(1) — Map.get / Set.has eliminate the inner scan`,
                        W: `JOIN-shaped logic that should be a hash join is implemented as a nested loop; latency goes super-linear with data size`,
                    },
                    remediation: `Pre-build a Map before the loop: \`const byKey = new Map(lookupArr.map((x) => [x.key, x])); for (...) { const hit = byKey.get(needle); }\`. If multiple lookup keys are needed, build multiple Maps or one Map with composite keys.`,
                    trace: t,
                }) } });
            },
        };
    },
};
