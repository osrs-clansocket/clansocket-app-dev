/**
 * LVI/no-blocking-loop-without-yield — `for` loop iterating a known-large literal range
 * (>= 1000) or with no async work and no setImmediate/yield. Risks starving the event loop.
 *
 * Heuristic: ForStatement with a numeric upper bound >= 1000 in the test expression,
 * OR ForOfStatement over an identifier where the loop body contains no await / setImmediate.
 * Reports only the high-confidence numeric-bound case to avoid false positives.
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

const THRESHOLD = 1000;

function loopUpperBound(node) {
    if (node.type !== "ForStatement") return null;
    if (!node.test || node.test.type !== "BinaryExpression") return null;
    if (node.test.operator !== "<" && node.test.operator !== "<=") return null;
    const right = node.test.right;
    if (right.type === "Literal" && typeof right.value === "number") return right.value;
    return null;
}

function bodyHasYield(node) {
    let yields = false;
    (function walk(n) {
        if (yields || !n || typeof n !== "object") return;
        if (Array.isArray(n)) { for (const c of n) walk(c); return; }
        if (n.type === "AwaitExpression") { yields = true; return; }
        if (n.type === "CallExpression") {
            const callee = n.callee;
            if (callee.type === "Identifier" && (callee.name === "setImmediate" || callee.name === "setTimeout" || callee.name === "queueMicrotask")) {
                yields = true;
                return;
            }
        }
        for (const k of Object.keys(n)) {
            if (k === "parent" || k === "loc" || k === "range") continue;
            walk(n[k]);
        }
    })(node.body);
    return yields;
}

module.exports = {
    meta: { type: "problem", docs: { description: "Long sync loop without yield — starves event loop" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        return {
            ForStatement(node) {
                const upper = loopUpperBound(node);
                if (upper === null || upper < THRESHOLD) return;
                if (bodyHasYield(node)) return;
                const t = trace(node, raw, mod);
                const ctx = getContext(node);
                context.report({ node, messageId: "report", data: { report: build4DReport({
                    rule: "no-blocking-loop-without-yield",
                    narrative: `${file}:${node.loc.start.line} runs a synchronous for loop with bound ${upper} (>=${THRESHOLD}) in ${ctx} with no await / setImmediate yield. While it runs, the event loop is blocked — no other request progresses.`,
                    graph: {
                        X: `${file}:${node.loc.start.line} — sync for loop iterating ${upper}+ times, no yield`,
                        Y: `total CPU time = N × per-iteration cost; all concurrent requests stall behind it`,
                        Z: `Long Loops Must Yield — the event loop is cooperative; sync hot loops starve everything else`,
                        W: `p99 latency spike correlated with the operation that triggers this loop; on-call sees 'random' slowdown that's actually deterministic`,
                    },
                    remediation: `Either: (1) break into chunks with \`await new Promise(r => setImmediate(r))\` every N iterations; (2) move to a worker thread if it's CPU-bound; (3) reduce N by indexing / pre-aggregation. Acceptable as-is ONLY for true boot-time / one-shot scripts (which this rule already exempts via /scripts/).`,
                    trace: t,
                }) } });
            },
        };
    },
};
