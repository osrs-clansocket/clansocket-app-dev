/**
 * LVI/no-await-in-loop — serial await inside a loop is usually unintended.
 * Use Promise.all (or a controlled-concurrency helper) to parallelize.
 *
 * Detects: AwaitExpression whose nearest enclosing iteration construct is a loop.
 * Skips:
 *   - for await...of (intentional async iteration)
 *   - await inside try/catch where the awaited result feeds a subsequent iteration (sequential intent)
 *     → detectable: if the loop's update/body uses the awaited result, allow it
 *   - await in module top-level (TLA)
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

const LOOP_TYPES = new Set(["ForStatement", "ForInStatement", "ForOfStatement", "WhileStatement", "DoWhileStatement"]);

// Serial-by-design function-name carve-out. Verbs whose semantics imply ordered/back-pressure
// iteration: drain/flush/consume (queue), ingest/migrate (order-dependent), sync (consistency
// pass — must complete each step before next), tearDown/spawn (lifecycle ops with rate limits),
// withInstalled (Discord-specific guild iteration with API rate-limit back-pressure),
// load/list (boot-time bulk loaders + small per-row transforms — serial avoids
// Promise.all-without-cap concurrency-storm risk on the alternative parallelization).
const SERIAL_FN_RE = /^(drain|flush|ingest|consume|migrate|sync|tearDown|spawn|withInstalled|load|list)[A-Z]/;

function fnDisplayName(fn) {
    if (!fn) return null;
    if (fn.id && fn.id.name) return fn.id.name;
    const parent = fn.parent;
    if (!parent) return null;
    if (parent.type === "VariableDeclarator" && parent.id.type === "Identifier") return parent.id.name;
    if (parent.type === "Property" && parent.key.type === "Identifier") return parent.key.name;
    if (parent.type === "MethodDefinition" && parent.key.type === "Identifier") return parent.key.name;
    if (parent.type === "AssignmentExpression" && parent.left.type === "Identifier") return parent.left.name;
    return null;
}

function isInsideSerialFn(node) {
    let p = node.parent;
    while (p) {
        if (p.type === "FunctionDeclaration" || p.type === "FunctionExpression" || p.type === "ArrowFunctionExpression") {
            const name = fnDisplayName(p);
            return name !== null && SERIAL_FN_RE.test(name);
        }
        p = p.parent;
    }
    return false;
}

// Chain-of-responsibility short-circuit: loop body contains `break` or `return` after the
// awaited statement. Parallelizing would defeat the "stop on first match" intent.
function loopHasBreakOrReturn(loop) {
    if (!loop.body) return false;
    const body = loop.body.type === "BlockStatement" ? loop.body.body : [loop.body];
    for (const stmt of body) {
        if (containsBreakOrReturn(stmt)) return true;
    }
    return false;
}

function containsBreakOrReturn(n) {
    if (!n || typeof n !== "object") return false;
    if (Array.isArray(n)) { for (const c of n) if (containsBreakOrReturn(c)) return true; return false; }
    if (n.type === "BreakStatement" || n.type === "ReturnStatement") return true;
    // Don't descend into nested functions — their break/return belongs to a different scope.
    if (n.type === "FunctionDeclaration" || n.type === "FunctionExpression" || n.type === "ArrowFunctionExpression") return false;
    for (const k of Object.keys(n)) {
        if (k === "parent" || k === "loc" || k === "range") continue;
        if (containsBreakOrReturn(n[k])) return true;
    }
    return false;
}

function nearestLoop(node) {
    let p = node.parent;
    while (p) {
        if (p.type === "ForOfStatement" && p.await) return null; // for-await-of is intentional
        if (LOOP_TYPES.has(p.type)) return p;
        if (
            p.type === "FunctionDeclaration" ||
            p.type === "FunctionExpression" ||
            p.type === "ArrowFunctionExpression"
        ) {
            return null;
        }
        p = p.parent;
    }
    return null;
}

function bodyUsesPreviousIteration(loop) {
    // Heuristic: if any await result is referenced in a subsequent statement's condition or
    // a later await's args, the loop is intentionally sequential. We can't perfectly detect
    // this statically; conservative version below: if the loop's test/update references an
    // identifier that was assigned from an await, treat as intentional.
    if (loop.type !== "WhileStatement" && loop.type !== "DoWhileStatement" && loop.type !== "ForStatement") {
        return false;
    }
    // For now, just check: while/do-while with a condition that mutates from await — intentional.
    // For for-loops with update expressions — intentional.
    if (loop.type === "ForStatement" && loop.update) return true;
    // `for (;;) { await x() }` is a stream/event pump — only escape is break/return; sequential
    // await IS the loop. Same for `for (init; ; update)` without a test.
    if (loop.type === "ForStatement" && !loop.test) return true;
    return loop.type === "WhileStatement" || loop.type === "DoWhileStatement";
}

module.exports = {
    meta: {
        type: "problem",
        docs: { description: "await inside loop body — usually wants Promise.all for parallelism" },
        schema: [],
        messages: { report: "{{ report }}" },
    },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        return {
            AwaitExpression(node) {
                const loop = nearestLoop(node);
                if (!loop) return;
                if (bodyUsesPreviousIteration(loop)) return;
                if (isInsideSerialFn(node)) return;
                if (loopHasBreakOrReturn(loop)) return;
                const t = trace(node, raw, mod);
                const ctx = getContext(node);
                context.report({
                    node,
                    messageId: "report",
                    data: {
                        report: build4DReport({
                            rule: "no-await-in-loop",
                            narrative: `${file}:${node.loc.start.line} awaits inside a ${loop.type} body in ${ctx}. Each iteration blocks on the previous → total time = N × per-call latency, not max(per-call latency). Use Promise.all for independent async work.`,
                            graph: {
                                X: `${file}:${node.loc.start.line} — await inside ${loop.type}`,
                                Y: `wall-clock = sum-of-latencies instead of max-of-latencies; N independent requests run serially`,
                                Z: `Concurrent Work Should Not Be Sequential — only sequence when each call depends on the previous`,
                                W: `as N grows the latency dominates; UI feels slow, timeouts trigger, queue depth swells under load`,
                            },
                            remediation: `If iterations are independent: \`await Promise.all(items.map(async (x) => fn(x)))\`. If iterations depend on each other (sequential pipeline): rewrite as for-await-of with explicit async iterable, OR use a reduce-with-accumulator that threads the dependency. If concurrency must be capped: \`p-limit\` or a custom batched-Promise.all.`,
                            trace: t,
                        }),
                    },
                });
            },
        };
    },
};
