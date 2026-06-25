/**
 * LVI/no-uninstrumented-loop — loops likely to grow unbounded with no observability hook.
 *
 * Heuristic: a loop body contains a `.prepare()`, `.run()`, `.get()`, `.all()`, or fetch()
 * call (suggesting it's doing real I/O work N times), but the enclosing function does not
 * call logger.* / metrics.* / observe / measure / span / counter. Without instrumentation,
 * when N grows unexpectedly there's no signal until the timeout fires.
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

const LOOP_TYPES = new Set(["ForStatement", "ForInStatement", "ForOfStatement", "WhileStatement", "DoWhileStatement"]);
const IO_METHODS = new Set(["prepare", "run", "get", "all", "iterate"]);
const IO_FNS = new Set(["fetch", "getOne", "getMany", "execMutation", "runMutation"]);
const INSTRUMENTATION_OBJECTS = new Set(["logger", "log", "metrics", "tracer", "span", "observe", "measure"]);

function isIoCall(node) {
    if (node.type !== "CallExpression") return false;
    if (node.callee.type === "Identifier") return IO_FNS.has(node.callee.name);
    if (node.callee.type === "MemberExpression" && node.callee.property.type === "Identifier") {
        return IO_METHODS.has(node.callee.property.name);
    }
    return false;
}

function isInstrumentationCall(node) {
    if (node.type !== "CallExpression") return false;
    if (node.callee.type !== "MemberExpression") return false;
    if (node.callee.object.type !== "Identifier") return false;
    return INSTRUMENTATION_OBJECTS.has(node.callee.object.name.toLowerCase());
}

module.exports = {
    meta: { type: "problem", docs: { description: "Loop with I/O but no instrumentation" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        const fnStack = [];
        function enterFn() { fnStack.push({ instrumented: false, loops: [] }); }
        function exitFn() {
            const fn = fnStack.pop();
            if (fn.instrumented) return;
            for (const loop of fn.loops) {
                const t = trace(loop.node, raw, mod);
                const ctx = getContext(loop.node);
                context.report({ node: loop.node, messageId: "report", data: { report: build4DReport({
                    rule: "no-uninstrumented-loop",
                    narrative: `${file}:${loop.node.loc.start.line} contains a loop with I/O inside (${ctx}) but the enclosing function has no logger/metrics call. When the iteration count grows unexpectedly there's no signal until the symptom (timeout, OOM) fires downstream.`,
                    graph: {
                        X: `${file}:${loop.node.loc.start.line} — ${loop.node.type} with I/O, no logger/metrics in enclosing fn`,
                        Y: `growth in iteration count is invisible; the loop silently consumes more wall-clock + DB time as data scales`,
                        Z: `What You Can't Measure You Can't Defend — instrumentation is the lowest-cost insurance for hot paths`,
                        W: `slow degradation under data growth — no alert fires until a downstream timeout cascades into incidents`,
                    },
                    remediation: `Add at least one of: (1) \`logger.info(\\\`<context> iterations=\${items.length} ms=\${Date.now()-startedAt}\\\`)\` at function exit; (2) record a metric counter on entry/exit; (3) explicit \`if (items.length > THRESHOLD) logger.warn(...)\` guard for known cliffs. The cost is one line; the savings is one less Sev2.`,
                    trace: t,
                }) } });
            }
        }
        return {
            FunctionDeclaration: enterFn,
            FunctionExpression: enterFn,
            ArrowFunctionExpression: enterFn,
            "FunctionDeclaration:exit": exitFn,
            "FunctionExpression:exit": exitFn,
            "ArrowFunctionExpression:exit": exitFn,
            CallExpression(node) {
                if (fnStack.length === 0) return;
                const fn = fnStack[fnStack.length - 1];
                if (isInstrumentationCall(node)) fn.instrumented = true;
            },
            ForStatement: collectLoop, ForInStatement: collectLoop, ForOfStatement: collectLoop, WhileStatement: collectLoop, DoWhileStatement: collectLoop,
        };
        function collectLoop(loopNode) {
            if (fnStack.length === 0) return;
            const fn = fnStack[fnStack.length - 1];
            let hasIo = false;
            (function walk(n) {
                if (!n || typeof n !== "object") return;
                if (Array.isArray(n)) { for (const c of n) walk(c); return; }
                if (n.type === "FunctionDeclaration" || n.type === "FunctionExpression" || n.type === "ArrowFunctionExpression") return;
                if (n.type && isIoCall(n)) { hasIo = true; return; }
                for (const k of Object.keys(n)) {
                    if (k === "parent" || k === "loc" || k === "range") continue;
                    walk(n[k]);
                }
            })(loopNode.body);
            if (hasIo) fn.loops.push({ node: loopNode });
        }
    },
};
