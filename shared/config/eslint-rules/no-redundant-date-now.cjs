/**
 * LVI/no-redundant-date-now — >=3 Date.now() calls in same function. Cache once.
 * Multiple Date.now() within a single function usually means slightly-different timestamps
 * for things that semantically should share one "now".
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

const THRESHOLD = 3;

function isDateNow(node) {
    if (node.type !== "CallExpression") return false;
    if (node.callee.type !== "MemberExpression") return false;
    if (node.callee.object.type !== "Identifier") return false;
    if (node.callee.property.type !== "Identifier") return false;
    return node.callee.object.name === "Date" && node.callee.property.name === "now";
}

module.exports = {
    meta: { type: "problem", docs: { description: ">=3 Date.now() calls in one function — cache once" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        const stack = [];
        function enter() { stack.push([]); }
        function exit() {
            const calls = stack.pop();
            if (calls.length < THRESHOLD) return;
            const first = calls[0];
            const t = trace(first, raw, mod);
            const ctx = getContext(first);
            context.report({ node: first, messageId: "report", data: { report: build4DReport({
                rule: "no-redundant-date-now",
                narrative: `${file}:${first.loc.start.line} calls Date.now() ${calls.length} times in ${ctx}. Each call is a syscall and returns a slightly different value — usually the function semantically wants ONE "now" used across the function body.`,
                graph: {
                    X: `${file}:${first.loc.start.line} — ${calls.length} Date.now() calls in same function`,
                    Y: `different timestamps used for things that should be atomic; subtle skew enters audit logs, dedup hashes, retention math`,
                    Z: `One Function = One Now — the function should snapshot now() once and pass it down`,
                    W: `audit chains break when two writes 'happen at the same time' record different ms values; debugging time-based regressions is a nightmare`,
                },
                remediation: `Hoist to a single \`const now = Date.now();\` at function entry and use \`now\` throughout. If different timestamps are intentional (rare, e.g. measuring elapsed), name them: \`const startedAt = Date.now(); /* work */ const finishedAt = Date.now();\`.`,
                trace: t,
            }) } });
        }
        return {
            FunctionDeclaration: enter,
            FunctionExpression: enter,
            ArrowFunctionExpression: enter,
            "FunctionDeclaration:exit": exit,
            "FunctionExpression:exit": exit,
            "ArrowFunctionExpression:exit": exit,
            CallExpression(node) {
                if (!isDateNow(node)) return;
                if (stack.length === 0) return;
                stack[stack.length - 1].push(node);
            },
        };
    },
};
